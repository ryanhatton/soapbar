fetch('https://soapbar.ryanhattonmain.workers.dev/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: "hello world" }),
  }).then(async(data) => {
    const json = await data.json()
    console.log(json)
  })

  //BASH COMMAND: yarn tsx test-request