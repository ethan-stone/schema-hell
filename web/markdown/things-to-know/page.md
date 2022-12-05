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

The second resource is more important if developing JSON schemas. The first resource uses AVRO schemas as a base to explain the concepts of compatibility, but if using JSON there are some additional rules that need to be considered, the most important being OPEN and CLOSED Content Models.

While these resources should be most of what you need. There are some specific problems we ran into developing schemas that I will describe so you so they may prevent anyone else from hitting these problems as well.

# Specific Problems We've Had

## OPEN and CLOSED Content Models with BACKWARD and FORWARD Compatible Schemas
