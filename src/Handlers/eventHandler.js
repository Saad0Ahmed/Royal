const { resolve } = require("path");
function loadEvents(client) {
  const ascii = require("ascii-table");
  const fs = require("fs");
  const table = new ascii().setHeading("Events", "Status");

  const folders = fs.readdirSync(resolve(__dirname, "../Events"));
  for (const folder of folders) {
    const files = fs
      .readdirSync(resolve(__dirname, `../Events/${folder}`))
      .filter((file) => file.endsWith(".js"));

    for (const file of files) {
      const event = require(resolve(__dirname, `../Events/${folder}/${file}`));

      if (event.rest) {
        if (event.once)
          client.rest.once(event.name, (...args) =>
            client.execute(...args, client)
          );
        else
          client.rest.on(event.name, (...args) =>
            client.execute(...args, client)
          );
      } else {
        if (event.once)
          client.on(event.name, (...args) => event.execute(...args, client));
        else client.on(event.name, (...args) => event.execute(...args, client));
      }
      table.addRow(file, "loaded");
      continue;
    }
  }
  return console.log(table.toString(), "\nLoaded events");
}

module.exports = { loadEvents };
