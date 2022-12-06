# Contents

# Intro

For a few months, my place of work has been working with Apache Kafka and embracing an event-driven architecture. A crucial part of using Kafka is developing schemas for the shape of the messages you send on Kafka topics, much like you would develop schemas for the request and response of a RESTful API.

The purpose of this page is to describe our experience developing schemas, including the all problems that came up over time. Particularly with Schema Evolution and Compatibility. These two concepts are simple on the surface, but once we started developing schemas we quickly got into a cycle of having to revise our schemas because there was a detail about Schema Evolution and Compatibility we did not know about. We coined a term for when we would discover one of these details and have to revise schemas, Schema Hell.

I hope you find this page useful so you don't make some of the mistakes we did.

# Choosing a Schema Format

Generally, these schemas use the AVRO format, thus Kafka messages are serialized and deserialized with AVRO which is natively binary. We initially used AVRO, but since we primarily use NodeJS there were some pain points using AVRO. The main one being there is no concept of "undefined" in AVRO. The closest you can get is setting a default value of null.

Thus after some consideration, we decided to switch to using JSON schemas and serialization. The tradeoff is that JSON has worse performance because it is serialized in ASCII rather than binary, but it found it to be a better developer experience and we already had experience writing JSON schemas. We were willing to take the performance hit because we took a closer look at the expected throughput of our Kafka topics and none were incredibly large. Thus the extra time it takes to serialize and validate JSON over AVRO was not significant.

After switching it makes sense why AVRO is the default. Most of the time Kafka applications are written in Java, and the tools/packages in the Java relating to AVRO schemas are very good. Thus the first lesson we learned is that take some time about which schema format you should use, taking into account performance requirements, developer experience, the programming language you are using, and anything else that the choice of schema may affect.

# Understanding Compatibility

Schemas inevitably change overtime. New features may require new datapoints which would require a new version of your schema. We did not take the time to understand the intricacies of schema compatibility, and because of that we definitely experience some troubles.

So the first thing I would suggest is thoroughly reading through the follow resources

- [Confluent Docs on Schema Evolution and Compatibility](https://docs.confluent.io/platform/current/schema-registry/avro.html)
- [Additional Rules that Apply to JSON Schemas](https://yokota.blog/2021/03/29/understanding-json-schema-compatibility/)

The first resource is crucial to read through and understand is most of what you need to develop schemas. I find the most important concepts to understand the difference between BACKWARD compatibility and FORWARD compatibility. This is because I had no idea that FORWARD compatibility was even a thing, and my understanding of BACKWARD compatbility was incorrect. Initially I thought all BACKWARD compatible meant was the next version is compatible with the previous version, but the real meaning is more specific.

The second resource is more important if developing JSON schemas. The first resource uses AVRO schemas as a base to explain the concepts of compatibility, but if using JSON there are some additional rules that need to be considered, the most important in my opinion being OPEN and CLOSED Content Models.

While these resources should be most of what you need. There are some specific problems we ran into developing schemas that I will describe so you so they may prevent anyone else from hitting these problems as well.

# Specific Problems We've Had

## Consequences of BACKWARD and FORWARD Compatiblility on OPEN and CLOSED Content Models
Not understanding the consequences of what compatibility you choose on if you should use an OPEN or CLOSED Content Model was one of the biggest initial mistakes we made developing schemas. I'll give a quick explanation of what OPEN and CLOSED Content Models are as well as BACKWARD and FORWARD Compatible Schemas actually mean first.

**A BACKWARD Compatible Schema means that consumers using thew new schema can read data produced with the previous schema. But it may be more helpful to think of it as being producers using the previous schema can still write data to consumers using the new schema**. As an example, suppose you have a schema for the request body of an API request. In this case API server is the consumer, and the client making the request is the producer. In this scenario, developers of the API would want to make BACKWARD Compatible schema changes, such that API server still functions properly when clients sent data using the previous schema. Or in other words, clients using the previous schema can still make requests to the API server which is using the new schema.

**A FORWARD Compatible Schema means that data produced with the new schema can still be read from consumers using the previous schema**. As an example, say we building a payment processing service like Stripe. When a charge is created in the `Charge Service` for a customer a message is sent on a Kafka topic, say `charge.created`. This allows the `Card Service` for example to be notified of the charge and use the customers card to and communicate with the card network to complete the transaction. For context on how credit card payment work you can look [here](https://www.corporatetools.com/credit-card-processing/payment-process/#:~:text=The%20credit%20card%20network%20passes,the%20appropriate%20card%20issuing%20bank.&text=The%20issuing%20bank%20then%20debits,to%20the%20merchant's%20payment%20processor.)

Before explaining OPEN and CLOSED Content Models, it's important to note that they only apply for JSON schemas. An OPEN Content Model means that for "object" type fields, additional fields can be includes in the object beyond the ones explicitly defined in the schema. This is the default JSON Schemas. A CLOSED Content Model means that for "object" type fields, additional fields can not be included.

Now, how does your desired compatibility effect whether or not you use an OPEN or CLOSED Content Model? Let's take the example of the API request body. Suppose the first schema of the request body is an object with an OPEN Content Model, meaning the client is allowed to send any additional fields in the object. For example...

```json
{
  "type": "object",
  "properties": {
    "age": {
      "type": "integer"
    }
  },
  "required": ["age"],
  "additionalProperties": true
}
```

An accetable payload for this schema would be this.

```json
{
  "age": 21
}
```
But also this because additional properties are allowed.

```json
{
  "age": 21,
  "height": 1.90 
}
```

Now let's say the developers decide to add the height field as an optional field in a new schema.

```json
{
  "type": "object",
  "properties": {
    "age": {
      "type": "integer"
    },
    "height": {
      "type": "integer"
    }
  },
  "required": ["age"],
  "additionalProperties": true
}
```

This schema has just broken the client sending the height field value of 1.90, because it is a floating point number, when now only integers are allowed. The decision to use an OPEN Content Model for the first schema has prevented us from adding the height field in a BACKWARD compatible way. Therefore the first schema should have used a CLOSED Content Model, such that the client couldn't have sent height in the first place, and the new height field could be added in the future.

In general in my experience, I have found that **if a BACKWARD Compatible Schema is required, then it is best to use a CLOSED Content Model for objects**.

Knowing this it might be easy to guess that **when a FORWARD Compatible Schema is required, then it is best to use an OPEN Content Model for objects**. This is true in my experience but I think it is important to understand why.

Expanding on the `charge.created` example above, suppose the schema for this message is the following.

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "amount": {
      "type": "integer"
    },
    "currency": {
      "type": "string"
    }
  },
  "required": ["id", "amount", "currency"],
  "additionalProperties": false
}
```

As you can tell we are not allowing additional properties to be sent in this object. Now suppose the `Charge Service` allows for a description to be added to the the charge, so the schema would be updated to the following.

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "amount": {
      "type": "integer"
    },
    "currency": {
      "type": "string"
    },
    "description": {
      "type": "string"
    }
  },
  "required": ["id", "amount", "currency"],
  "additionalProperties": false
}
```

This will cause a problem. Since additional properties are not allowed, if the `Card Service` decides not to update to the latest version of the schema, then the service will reject all messages coming from the `Charge Service` that include a description because the `Card Service` does not allow any fields beside "id", "amount", and "currency". This is why **when a FORWARD Compatible Schema is required, then it is best to use an OPEN Content Model for objects**.

The main takeaways for this are
- **when a BACKWARD Compatible Schema is required, then it is best to use a CLOSED Content Model for objects**
- **when a FORWARD Compatible Schema is required, then it is best to use an OPEN Content Model for objects**

## Consequences of BACKWARD and FORWARD Compatiblility on Enums 
After understanding the consequences of BACKWARD and FORWARD Compatiblility on our use of OPEN and CLOSED Content Models, the next issue we ran into was the effects compatibility has on our use of enums.

The consequences on Enums are in essence the same as on Open and CLOSED Content Models. If you need BACKWARD Compatibility, then it is okay to use an Enum for a "string" type field, and then add more acceptable values over time. However, if a field is a string you can not then change it to an Enum. If you need FORWARD Compatibility, then you should be careful when deciding to use an Enum. This is because if you need to add a new value in the Enum, consumers using the previous schema that don't have that value in the acceptable list of values will reject messages containing the new value. This means Enums should only be used if you are **absolutely 100% sure** that no additional values will be added in the future. This for us is hard to gaurantee, therefore we found it best in most cases to not use Enums at all when FORWARD Compatibility is required, and if the possible values is limited we simply document the possible values in the fields description like so.

```json
{
  "type": "object",
  "properties": {
    "cardType": {
      "type": "string",
      "description": "Possible values are CREDIT and DEBIT"
    }
  }
}
```