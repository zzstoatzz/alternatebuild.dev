hello world
in 2024, we're going to try and write our ideas down more.

ideas early this year
clever Assistant retrieval of highly annotated documents that embedded in vectordbs like chroma, redis and/or turbopuffer. Assistants can call functions, its time they use that to make metadata-filtered queries from natural language. assistants should also have tools to store typed key excerpts from interactions as documents, to make them referenceable in the future.

application state is just a `type[BaseModel]` on a thing that can patch its own schema with knowledge from the world. see this example.

imagine celery tasks as circumstantial nodes in a graph. they can be invoked at any time, from anywhere, including from other tasks. what if, hypothetically speaking, you could do horizontal scaling via k-means?