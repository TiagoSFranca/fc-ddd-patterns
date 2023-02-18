import CustomerCreatedEvent from "../customer-created.event";
import EnviaConsoleLog1Handler from "./envia-console-log-1.handler";

describe("envia console log 1 handler test", () => {
  it("should log info when handler is called", async () => {
    console.log = jest.fn();

    const handler = new EnviaConsoleLog1Handler();

    const event = new CustomerCreatedEvent({});

    handler.handle(event);

    expect(console.log).toHaveBeenCalledWith("Esse é o primeiro console.log do evento: CustomerCreated");
  });
});
