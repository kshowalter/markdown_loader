# Markdown Loader

Converts markdown into specDOM.


## Javascript

Anything inside "${" and "}" will be evaluated as javascript. (see [Template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals))

Anything inside "<<" and ">>" will be added as parameters of the element.

Example:

    # Title <<class="title">>

    <h1 class="title"></h1>
