import CustomerCreatedEvent from "../customer-created.event";
import EnviaConsoleLog2Handler from "./envia-console-log-2.handler";

describe("envia console log 2 handler test", () => {
  it("should log info when handler is called", async () => {
    console.log = jest.fn();

    const handler = new EnviaConsoleLog2Handler();

    const event = new CustomerCreatedEvent({});

    handler.handle(event);

    expect(console.log).toHaveBeenCalledWith("Esse é o segundo console.log do evento: CustomerCreated");
  });
});
