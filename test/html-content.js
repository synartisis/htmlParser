export const HTMLDocument = /*html*/`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
      /* css content */
    </style>
  </head>
  <body>
    <div id="div1">
      div content
    </div>
    text node
    <section>
      <article>
        <header>article header</header>
        <p>
          article content
          in a paragraph
        </p>
        <p>
          second paragraph
        </p>
      </article>
    </section>
    <main>
      <div id="div2">
        <div id="div2a"></div>
      </div>
    </main>
    <script>
      // js content
    </script>
  </body>
  </html>
`


export const HTMLFragment = /*html*/`
  <section>
    <div id="child1">child1 content</div>
    <div id="child2">child2 content</div>
  </section>
`
