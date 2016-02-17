## SlimView implementation example

Before you dive into the [API documentation](api.md) and start implementation, there are a few pieces of information 
that is worth knowing.

 1. What is SlimView
 2. How SlimView [communicates](#communication) with your application
 3. What tech requirements there are for SlimView to function properly
 
### What is SlimView

You can think of SlimView as a way to display a preview of a website with the capability of updating textual content
while you are looking at it.

Due to the nature of the web, SlimView has got some limitations. 
It will not be able to display every and all modification one might do with Easyling or a CAT tool. SlimView works by 
identifying translatable *block of texts* in the markup (HTML) and updating them upon request. If a piece of 
translatable content is not in the markup (eg. it is in JS), SlimView won't be able to highlight modifications to it.
 
### Communication
 
WIP
 
### Tech requirements

WIP