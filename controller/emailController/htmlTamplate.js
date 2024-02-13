/*The following function will return an html tamplate to send an email
with the name (customer), email (customer) and time. In this email
we will confirm to the customer that his/her email was sent successfully
and that I will contact him/her soon...*/

/*TODO: obvio hay que crear el html tamplate correcto para que se haga el envio 
del correo... */
const htmlTamplate = (name, email) => {
    return html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Template</title>
        </head>
        <body>
            <h1>¡Hola, ${name}!</h1>
            <p>Gracias por utilizar nuestro servicio. Tu correo electrónico registrado es: ${email}</p>
            <!-- Puedes añadir más contenido HTML según tus necesidades -->
        </body>
        </html>
    `;
}

module.exports = htmlTamplate;