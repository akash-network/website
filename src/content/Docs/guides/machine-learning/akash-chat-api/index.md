---
categories: ["Guides"]
tags: ["Machine Learning", "GPT", "API"]
weight: 1
title: "Akash Chat API"
linkTitle: "Akash Chat API"
---

The Akash Chat API is an open and permissionless Llamma3 API that is powered by the Akash Supercloud. Access is available for absolutely free to anyone.

## Introduction

Go to the [Chat API's Page](https://chatapi.akash.network/). Click on the "Get Started Button".

You'll be redirected to the key-generation page. Enter a name, agree with the terms, and click on the "Generate An API" button. Copy the generated key and keep it somewhere safe and secure. 


## Python Examples

You would need to have Python installed on your computer. To verify if you have Python installed on your computer, go to Terminal/CommandLine and run:

```

python --version

```




If you have Python installed, you should see something similar to the response below:

```
Python 3.9.13

```

Otherwise, download Python from either the [official website](https://python.org), or the [free Anaconda distribution](https://www.anaconda.com/download/) if you intend to do a lot of work in AI/ML and Data Science, as it comes with a lot of relevant libraries pre-installed.

Install the OpenAI library

```
pip install openai

```

### Basic Text Completion

This example demonstrates how to generate a text completion based on a prompt .

```

import openai

# Set your API key
client = openai.OpenAI(
    api_key="sk-xxxxxxxx",
    base_url="https://chatapi.akash.network/api/v1"
)


# Generate a completion
response = client.chat.completions.create(
    model="Meta-Llama-3-1-8B-Instruct-FP8",  # Specify the model
    messages = [
        {
            "role": "user",
            "content": "Once upon a time, in a land far, far away"
        }
    ],
    
)

# Print the generated text
print(response.choices[0].message.content.strip())


```

You should receive something similar to this:

```
...there was a beautiful kingdom, hidden from the rest of the world by a veil of mist and legend. The kingdom was called Azura, and it was a place of wonder, where magic was woven into the very fabric of everyday life. The people of Azura lived in harmony with the land, respecting the ancient traditions and rituals that had been passed down through generations.

In the heart of the kingdom, there stood a magnificent castle, its towers reaching high into the sky like giant's fists. The castle was the seat of power, where the wise and just king, Maric, ruled over Azura with kindness and wisdom. King Maric was loved by his people, and his rule was marked by peace and prosperity.

But little did anyone know, a great darkness was stirring in the shadows, threatening to disrupt the balance of the kingdom. A powerful sorcerer, named Malakai, had been secretly gathering his strength, seeking to overthrow King Maric and claim the throne for himself...

Would you like me to continue the story, or do you have any other requests?

```

### Conversation with AkashChat
This example simulates a conversation with AkashChat, maintaining the context across multiple interactions.

```

import openai

# Set your API key
client = openai.OpenAI(
    api_key="sk-xxxxxxxx",
    base_url="https://chatapi.akash.network/api/v1"
)

# Start the conversation
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Who won the FIFA World Cup in 2022?"}
]

# Generate a response
response = client.chat.completions.create(
    model="Meta-Llama-3-1-405B-Instruct-FP8",  # Specify the model
    messages=messages
)

# Print the assistant's reply
print(response.choices[0].message.content)

# Continue the conversation
messages.append({"role": "assistant", "content": response.choices[0].message.content})
messages.append({"role": "user", "content": "Can you tell me more about that?"})

# Generate another response
response = client.chat.completions.create(
    model="Meta-Llama-3-1-405B-Instruct-FP8",
    messages=messages
)

```
You should receive a response similar to:

```

Argentina won the 2022 FIFA World Cup, which was held in Qatar from November 20 to December 18, 2022. They defeated France 4-2 in a penalty shootout, after the match ended 3-3 after extra time, in the final on December 18, 2022.
The 2022 FIFA World Cup Final was a historic match between Argentina and France, held at the Lusail Iconic Stadium in Lusail, Qatar. The match was played on December 18, 2022, in front of a packed stadium with over 88,000 spectators.

Argentina, led by their captain Lionel Messi, took an early lead with Messi scoring a penalty in the 23rd minute and Angel Di Maria adding another goal in the 36th minute. Argentina seemed to be in control, but France staged an incredible comeback in the second half.

Kylian Mbappé scored two goals in the 80th and 81st minutes to level the score at 2-2, sending the match into extra time. In extra time, Messi scored again in the 108th minute, but Mbappé equalized once more with a penalty in the 118th minute, making the score 3-3.

As the match ended 3-3 after extra time, it went to a penalty shootout to determine the winner. Argentina goalkeeper Emiliano Martínez made a crucial save, and Gonzalo Montiel scored the winning penalty, securing a 4-2 victory for Argentina in the shootout.

Lionel Messi was awarded the Golden Ball as the tournament's best player, and Emiliano Martínez received the Golden Glove as the best goalkeeper. This victory marked Argentina's third World Cup title, with their previous wins in 1978 and 1986.

The match was widely regarded as one of the greatest World Cup finals of all time, with many praising the incredible performances of both teams, particularly Messi and Mbappé.

```
### Generating Code Snippets

You can use the AkashChat API to generate code snippets in a similar fashion.

```
import openai

# Set your API key
client = openai.OpenAI(
    api_key="sk-xxxxxxxx",
    base_url="https://chatapi.akash.network/api/v1"
)

# Create a prompt to generate code
prompt = "Write a Python function to reverse a string."

# Generate code
response = client.chat.completions.create(
    model="Meta-Llama-3-1-405B-Instruct-FP8",
    messages=[{"role": "user", "content": prompt}],
    max_tokens=100,
    temperature=0  # Lower temperature means more deterministic results
)

# Print the generated code
print(response.choices[0].message.content.strip())
```
SHould give you something similar to:

```
**Reversing a String in Python**
================================

Here's a simple function that uses Python's slicing feature to reverse a string.

```python
def reverse_string(s):
    """
    Reverses a given string.

    Args:
        s (str): The string to be reversed.

    Returns:
        str: The reversed string.
    """
    return s[::-1]
```


### Summarization
For summarizing text, you would still use the chat.completions.create() method:

```
import openai

# Set your API key
client = openai.OpenAI(
    api_key="sk-xxxxxxxx",
    base_url="https://chatapi.akash.network/api/v1"
)

# Long text to summarize
text = """
Artificial intelligence (AI) is intelligence demonstrated by machines, in contrast to the natural intelligence displayed by humans and animals. 
Leading AI textbooks define the field as the study of "intelligent agents": any device that perceives its environment and takes actions that maximize its chance of successfully achieving its goals. 
Colloquially, the term "artificial intelligence" is often used to describe machines (or computers) that mimic "cognitive" functions that humans associate with the human mind, such as "learning" and "problem-solving".
"""

# Generate a summary
response = client.chat.completions.create(
    model="Meta-Llama-3-1-405B-Instruct-FP8",
    messages=[{"role": "user", "content": f"Summarize the following text:\n\n{text}"}],
    max_tokens=50
)

# Print the summary
print(response.choices[0].message.content.strip())

```

You should get a response similar to:

```

Artificial intelligence (AI) refers to the intelligence exhibited by machines, as opposed to natural human and animal intelligence. It involves the study of intelligent agents that perceive their environment and take actions to achieve their goals, and is often associated with machines that mimic

```








