# playground

Testing out packages and such

Last updated: 04/10/2021

## How to start a local server

1. Open up Terminal in the root folder
2. Execute `python3 -m http.server`
3. Navigate to <https://localhost:8000> in your browser
4. Enjoy!

## NOTES

### Engine vs Framework vs Library

Really great read: <https://gamefromscratch.com/gamedev-glossary-library-vs-framework-vs-engine/>

An engine is an integrated development environment that typically exposes a GUI for development.
This is the fully complete package that you usually download and install and is really big and expensive.
The big downside is being completely tied to the program --- if it's not what you need, can't fix it!

| Example | Scripting Language | Link |
| --- | --- | --- |
| Gdevelop | JS | [Link](https://gdevelop-app.com/) |
| PlayCanvas | JS | [Link](https://playcanvas.com/) |

This is where the "name brand" programs live -- makes sense that companies would use these!

| Example | Scripting Language | Link |
| --- | --- | --- |
| Unity | C# | [Link](https://unity.com/) |
| Unreal Engine | C++ | [Link](https://www.unrealengine.com/en-US/) |

A framework is a collection of libraries for most of the activities you need the framework for.
In other words, you use their pre-made features and workflow to make things happen in your own environment.
This means you'll be learning their file structures, their tools, and their way of developing.
While this speeds up dev considerably in the long run, it forces you to do things "their way" for the most part.

| Example | Best For | Link |
| --- | --- | --- |
| Phaser | 2D Games | [Link](https://phaser.io/) |
| BabylonJS | 3D Games | [Link](https://www.babylonjs.com/) |

A library is just a collection of code that abstracts tasks to simple commands.
Often these are each geared towards a single task: physics, audio, lighting, etc.
This can considerably speed up the low-level operations, but doesn't provide you with any guidance.
That is, you're still building the most basic code, but now you're doing it with enhancements!

| Example | Purpose | Link |
| --- | --- | --- |
| three.js | 3D Renderer | [Link](https://threejs.org/) |
| pixiJS | 2D Renderer | [Link](https://www.pixijs.com/) |
| matterJS | Physics | [Link](https://brm.io/matter-js/) |

## Collaborators

- Adam Coscia
- Trevor Coscia
