// @ts-check
// Auto-generated using ChatGPT. Not used for now. Not so eager to try OpenAI functions.
export const functions = [
    {
        "name": "SEARCH_COMMAND",
        "description": "Search google for a query to get more information about a subject.",
        "parameters": {
            "type": "object",
            "properties": {
                "reason": {
                    "type": "string",
                    "description": "Why you want to search google."
                },
                "query": {
                    "type": "string",
                    "description": "The specific query to search."
                }
            }
        }
    },
    {
        "name": "BROWSE_COMMAND",
        "description": "Browse one of the google search result to a website and return a summary.",
        "parameters": {
            "type": "object",
            "properties": {
                "reason": {
                    "type": "string",
                    "description": "Why you want to browse this specific url."
                },
                "url": {
                    "type": "string",
                    "description": "The URL to browse."
                }
            }
        }
    },
    {
        "name": "DIR_COMMAND",
        "description": "List the current project file structure",
        "parameters": {
            "type": "object",
            "properties": {
                "reason": {
                    "type": "string",
                    "description": "Why you want to list files from this folder."
                }
            }
        }
    },
    {
        "name": "READ_COMMAND",
        "description": "Read a file to aid in your work.",
        "parameters": {
            "type": "object",
            "properties": {
                "reason": {
                    "type": "string",
                    "description": "Why you want to execute read this file."
                },
                "path": {
                    "type": "string",
                    "description": "The relative path to the file to read."
                }
            }
        }
    },
    {
        "name": "RENAME_COMMAND",
        "description": "Rename a file.",
        "parameters": {
            "type": "object",
            "properties": {
                "reason": {
                    "type": "string",
                    "description": "Why you want to rename this file."
                },
                "previous_path": {
                    "type": "string",
                    "description": "The previous relative path of the file."
                },
                "new_path": {
                    "type": "string",
                    "description": "The new relative path of the file."
                }
            }
        }
    },
    {
        "name": "DONE_COMMAND",
        "description": "Signify that you are done with the initial request.",
        "parameters": {
            "type": "object",
            "properties": {
                "reason": {
                    "type": "string",
                    "description": "Why you think you are done."
                }
            }
        }
    },
    {
        "name": "ASK_COMMAND",
        "description": "Ask a question to the user when you need more information about a subject.",
        "parameters": {
            "type": "object",
            "properties": {
                "reason": {
                    "type": "string",
                    "description": "Why you want to ask a question to the user."
                },
                "question": {
                    "type": "string",
                    "description": "The question you need to ask."
                }
            }
        }
    },
    {
        "name": "WRITE_COMMAND",
        "description": "Modify or create a new file, and print its full content.",
        "parameters": {
            "type": "object",
            "properties": {
                "reason": {
                    "type": "string",
                    "description": "Why you want to write this file."
                },
                "path": {
                    "type": "string",
                    "description": "The relative path to the file."
                },
                "file_content": {
                    "type": "string",
                    "description": "The full content to write to the file."
                }
            }
        }
    },
    {
        "name": "CMD_COMMAND",
        "description": "Execute a command on an OSX/Linux system.",
        "parameters": {
            "type": "object",
            "properties": {
                "reason": {
                    "type": "string",
                    "description": "Why you want to execute this command."
                },
                "command": {
                    "type": "string",
                    "description": "The command to execute."
                }
            }
        }
    },
    {
        "name": "FINDIMAGE_COMMAND",
        "description": "Find or search for a PNG image or icon for an app, website or game.",
        "parameters": {
            "type": "object",
            "properties": {
                "reason": {
                    "type": "string",
                    "description": "Why you want to find this image."
                },
                "image_width": {
                    "type": "number",
                    "description": "The width of the image."
                },
                "image_height": {
                    "type": "number",
                    "description": "The height of the image."
                },
                "path": {
                    "type": "string",
                    "description": "The relative path to the file in the project."
                },
                "description": {
                    "type": "string",
                    "description": "The description of the image."
                }
            }
        }
    }
]