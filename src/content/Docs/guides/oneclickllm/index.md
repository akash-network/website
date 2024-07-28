---
categories: ["Guides"]
tags: ["Deployment", "API"]
weight: 1
title: "OneClickLLM"
linkTitle: "OneClickLLM"
---

[OneClickLLM](https://one-click-llm.vercel.app/) simplifies the deployment of LLM inference APIs on the Akash Network, allowing users to deploy any open source large language model from Huggingface or Ollama Registry with zero configuration. With the capability to deploy within seconds, users can select a model, generate a properly configured SDL file, and deploy it seamlessly on the [Akash Console](https://console.akash.network) or the console. The API is compatible with the popular OpenAI library, serving as a drop-in replacement. The fully automated and managed deployment process ensures high availability, scalability, and security, making it easy to deploy your own LLM or use the free demo [API](https://one-click-llm.vercel.app/free-demo-api/example/).

# Free Demo Inference API

OneClickLLM offers a free API endpoint featuring llava-phi3, llama2-7b, and Mistril-7b models. These endpoints allow users to explore and become familiar with the functionalities before deciding to deploy your private LLM inference API. The endpoints are also compatible with the OpenAI library and serve as an open-source drop-in replacement.


## Base Link

You can access the API using the follwing base link:

```
https://kk3lu4jbrtdr98lh63g7vrq75k.ingress.akash-cloud.com

```

## Examples

### Generate Request (Streaming)

**Request:**

```

curl http://baseAkashUrl/api/generate -d '{
  "model": "llava-phi3",
  "prompt": "What is quantum mechanics?"
}'

```

**Response:**

If `stream` is set to `false`, the response will be a single JSON object:

```

{
  "model": "llava-phi3",
  "created_at": "2023-08-04T19:22:45.499127Z",
  "response": "It is a field of physics dealing with sub atomic particles.",
  "done": true,
  "context": [1, 2, 3],
  "total_duration": 5043500667,
  "load_duration": 5025959,
  "prompt_eval_count": 26,
  "prompt_eval_duration": 325953000,
  "eval_count": 290,
  "eval_duration": 4709213000
}

```

# EndPoint Documentation

## Streamlining LLM Inference API Deployment on Akash Network via Ollama, vLLM, and Llama-cpp

Deploy open-source models within seconds and a few clicks on the Akash Network:

- Our aim is to streamline the deployment of LLM APIs on the Akash Network. 
- Our goal is to make it easy for users to deploy their preferred LLM models without worrying about the underlying infrastructure. 
- Users can simply select the LLM model they wish to deploy, and we will provide them with a properly configured SDL file with an inference server. 
- Once users have the SDL file, they can deploy the LLM API on the Akash Network with just a few clicks on the [Akash Console](https://console.akash.network)or using the [CLI](/docs/deployments/akash-cli/overview/). 
- The deployment process is fully automated and managed by the Akash Network, ensuring that the service is highly available, scalable, and secure.

## Endpoints

- [Generate a completion](#generate-a-completion)
- [Generate a chat completion](generate-a-chat-completion)
- [List loaded models](list-loaded-models)
- [Show model information](show-model-information)

## Conventions

### Model names:

Model names follow a `model:tag` format, where model can have an optional namespace such as `example/model`. Some examples are `phi3` and `llama3:70b`. The tag is optional and, if not provided, will default to latest. The tag is used to identify a specific version.

### Durations:

All durations are returned in nanoseconds.

### Streaming responses:

Certain endpoints stream responses as JSON objects and can optionally return non-streamed responses.


## Generate a Completion

```

POST /api/generate

```

Generate a response for a given prompt with a provided model. This is a streaming endpoint, so there will be a series of responses. The final response object will include statistics and additional data from the request.

### Parameters

- `model` (required): The [model name](#model-names)
- `prompt`: The prompt to generate a response for
- `images` (optional): A list of base64-encoded images (for multimodal models such as `llava`)

### Examples

#### Generate request (Streaming)

**Request:**

```

curl http://baseAkashUrl/api/generate -d '{
  "model": "llama3",
  "prompt": "What is quantum mechanics?"
}'

```

**Response:**

A stream of JSON objects is returned:

```

{
  "model": "llama3",
  "created_at": "2023-08-04T08:52:19.385406455-07:00",
  "response": "The",
  "done": false
}

```

The final response in the stream also includes additional data about the generation:

- `total_duration`: Time spent generating the response
- `load_duration`: Time spent in nanoseconds loading the model
- `prompt_eval_count`: Number of tokens in the prompt
- `prompt_eval_duration`: Time spent in nanoseconds evaluating the prompt
- `eval_count`: Number of tokens in the response
- `eval_duration`: Time in nanoseconds spent generating the response
- `context`: An encoding of the conversation used in this response, which can be sent in the next request to keep a conversational memory
- `response`: Empty if the response was streamed; if not streamed, this will contain the full response

#### Generate request (No streaming)

**Request:**

```

curl http://baseAkashUrl/api/generate -d '{
  "model": "llama3",
  "prompt": "What is quantum mechanics?",
  "stream": false
}'

```

**Response:**

If `stream` is set to `false`, the response will be a single JSON object:


```

{
  "model": "llama3",
  "created_at": "2023-08-04T19:22:45.499127Z",
  "response": "It is a field of physics dealing with subatomic particles.",
  "done": true,
  "context": [1, 2, 3],
  "total_duration": 5043500667,
  "load_duration": 5025959,
  "prompt_eval_count": 26,
  "prompt_eval_duration": 325953000,
  "eval_count": 290,
  "eval_duration": 4709213000
}

```

#### Generate request (JSON mode)

When `format` is set to `json`, the output will always be a well-formed JSON object. It’s important to also instruct the model to respond in JSON.

**Request:**

```

curl http://baseAkashUrl/api/generate -d '{
  "model": "llama3",
  "prompt": "What color is the sky at different times of the day? Respond using JSON",
  "format": "json",
  "stream": false
}'

```

**Response:**

```

{
  "model": "llama3",
  "created_at": "2023-11-09T21:07:55.186497Z",
  "response": "{\n\"morning\": {\n\"color\": \"blue\"\n},\n\"noon\": {\n\"color\": \"blue-gray\"\n},\n\"afternoon\": {\n\"color\": \"warm gray\"\n},\n\"evening\": {\n\"color\": \"orange\"\n}\n}\n",
  "done": true,
  "context": [1, 2, 3],
  "total_duration": 4648158584,
  "load_duration": 4071084,
  "prompt_eval_count": 36,
  "prompt_eval_duration": 439038000,
  "eval_count": 180,
  "eval_duration": 4196918000
}

```

The value of `response` will be a string containing JSON similar to:

```

{
  "morning": {
    "color": "blue"
  },
  "noon": {
    "color": "blue-gray"
  },
  "afternoon": {
    "color": "warm gray"
  },
  "evening": {
    "color": "orange"
  }
}

```

#### Generate request (With options)

If you want to set custom options for the model at runtime rather than in the Modelfile, you can do so with the `options` parameter. This example sets every available option, but you can set any of them individually and omit the ones you do not want to override.

**Request:**

```

curl http://baseAkashUrl/api/generate -d '{
  "model": "llama3",
  "prompt": "Why is the sky blue?",
  "stream": false,
  "options": {
    "num_keep": 5,
    "seed": 42,
    "num_predict": 100,
    "top_k": 20,
    "top_p": 0.9,
    "tfs_z": 0.5,
    "typical_p": 0.7,
    "repeat_last_n": 33,
    "temperature": 0.8,
    "repeat_penalty": 1.2,
    "presence_penalty": 1.5,
    "frequency_penalty": 1.0,
    "mirostat": 1,
    "mirostat_tau": 0.8,
    "mirostat_eta": 0.6,
    "penalize_newline": true,
    "stop": ["\n", "user:"],
    "numa": false,
    "num_ctx": 1024,
    "num_batch": 2,
    "num_gpu": 1,
    "main_gpu": 0,
    "low_vram": false,
    "f16_kv": true,
    "vocab_only": false,
    "use_mmap": true,
    "use_mlock": false,
    "num_thread": 8
  }
}'

```

**Response:**

```

{
  "model": "llama3",
  "created_at": "2023-08-04T19:22:45.499127Z",
  "response": "The sky is blue because it is the color of the sky.",
  "done": true,
  "context": [1, 2, 3],
  "total_duration": 4935886791,
  "load_duration": 534986708,
  "prompt_eval_count": 26,
  "prompt_eval_duration": 107345000,
  "eval_count": 237,
  "eval_duration": 4289432000
}

```

#### Load a Model

If an empty prompt is provided, the model will be loaded into memory.


**Request:**

```

curl http://baseAkashUrl/api/generate -d '{
  "model": "llama3"
}'

```

**Response:**

A single JSON object is returned:

```

{
  "model": "llama3",
  "created_at": "2023-12-18T19:52:07.071755Z",
  "response": "",
  "done": true
}

```

## Generate a Chat Completion 

```

POST /api/chat

```

This endpoint generates the next message in a chat conversation using the specified model. By default, this is a streaming endpoint, providing a series of responses. Streaming can be disabled with the `"stream": false` parameter. The final response object includes detailed statistics and additional data from the request.

### Parameters

- `model` (required): The name of the [model](#model-names) to use.
- `messages`: An array of messages that make up the chat. This helps maintain the chat history. Each message object includes:
    - `role`: The role of the message sender. Can be `system`, `user`, or `assistant`.
    - `content`: The text content of the message.
    - `images` (optional): A list of base64-encoded images to include in the message (for multimodal models like `llava`).

### Examples

#### Chat Request (Streaming)

**Request:**

```

curl http://baseAkashUrl/api/chat -d '{
  "model": "llama3",
  "messages": [
    {
      "role": "user",
      "content": "Why is the sky blue?"
    }
  ]
}'


```

**Response:**

A stream of JSON objects is returned:

```

{
  "model": "llama3",
  "created_at": "2023-08-04T08:52:19.385406455-07:00",
  "message": {
    "role": "assistant",
    "content": "The",
    "images": null
  },
  "done": false
}

```

**Final Response:**

```

{
  "model": "llama3",
  "created_at": "2023-08-04T19:22:45.499127Z",
  "done": true,
  "total_duration": 4883583458,
  "load_duration": 1334875,
  "prompt_eval_count": 26,
  "prompt_eval_duration": 342546000,
  "eval_count": 282,
  "eval_duration": 4535599000
}

```

#### Chat Request (No Streaming)

**Request:**

```

curl http://baseAkashUrl/api/chat -d '{
  "model": "llama3",
  "messages": [
    {
      "role": "user",
      "content": "Why is the sky blue?"
    }
  ],
  "stream": false
}'

```

**Response:**

```

{
  "model": "llama3:latest",
  "created_at": "2023-12-12T14:13:43.416799Z",
  "message": {
    "role": "assistant",
    "content": "The sky appears blue due to the scattering of sunlight by the atmosphere."
  },
  "done": true,
  "total_duration": 5191566416,
  "load_duration": 2154458,
  "prompt_eval_count": 26,
  "prompt_eval_duration": 383809000,
  "eval_count": 298,
  "eval_duration": 4799921000
}

```

## List Loaded Models

```

GET /api/tags

```

This endpoint lists the models available locally on the server.

## Example

**Request:**

```

curl http://baseAkashUrl/api/tags

```

**Response:**

```

{
  "models": [
    {
      "name": "codellama:13b",
      "modified_at": "2023-11-04T14:56:49.277302595-07:00",
      "size": 7365960935,
      "digest": "9f438cb9cd581fc025612d27f7c1a6669ff83a8bb0ed86c94fcf4c5440555697",
      "details": {
        "format": "gguf",
        "family": "llama",
        "parameter_size": "13B",
        "quantization_level": "Q4_0"
      }
    },
    {
      "name": "llama3:latest",
      "modified_at": "2023-12-07T09:32:18.757212583-08:00",
      "size": 3825819519,
      "digest": "fe938a131f40e6f6d40083c9f0f430a515233eb2edaa6d72eb85c50d64f2300e",
      "details": {
        "format": "gguf",
        "family": "llama",
        "parameter_size": "7B",
        "quantization_level": "Q4_0"
      }
    }
  ]
}

```

## Show Model Information


```

POST /api/show

```

This endpoint retrieves detailed information about a specific model, including its details, modelfile, template, parameters, license, and system prompt.

### Parameters

- `name`: The name of the model for which to show information.

### Example

**Request:**


```

curl http://baseAkashUrl/api/show -d '{
  "name": "llama3"
}'

```
