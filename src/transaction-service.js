const { ServiceBroker } = require("moleculer");
const HTTPServer = require("moleculer-web");
const DbService = require("moleculer-db");

const brokerNode1 = new ServiceBroker({
  namespace: "dev",
  nodeID: "node-1",
  transporter: "NATS",
});

brokerNode1.createService({
  name: "gateway",
  mixins: [HTTPServer],

  settings: {
    port: process.env.PORT || 3000,
    ip: "0.0.0.0",
    use: [],
    routes: [
      {
        path: "/transaction",
        aliases: {
          "GET list": "transactions.list",
          "POST add": "transactions.add",
          "DELETE del/:id": "transactions.del",
        },
      },
    ],
  },
});

const brokerNode2 = new ServiceBroker({
  namespace: "dev",
  nodeID: "node-2",
  transporter: "NATS",
});

brokerNode2.createService({
  name: "transactions",
  mixins: [DbService],

  settings: {
    fields: ["_id", "to", "from", "value"],
    entityValidator: {
      to: "string",
      value: "string",
    },
  },

  actions: {
    list: {
      async handler(ctx) {
        return this.broker.call("transactions.find", {});
      },
    },
    add: {
      async handler(ctx) {
        return this.broker.call("transactions.create", ctx.params);
      },
    },
    del: {
        async handler(ctx) {
          return this.broker.call("transactions.remove", { id: ctx.params.id });
        },
      },
  },

  afterConnected() {},
});

// Start both brokers
Promise.all([brokerNode1.start()], [brokerNode2.start()]).then(() => {
  brokerNode1.repl();
  brokerNode2.repl();
});
