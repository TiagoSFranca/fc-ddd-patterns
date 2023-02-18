import Address from "../../value-object/address";
import CustomerUpdatedAddressEvent from "../customer-updated-address";
import EnviaConsoleLogHandler from "./envia-console-log.handler";

describe("envia console log handler test", () => {
  it("should log info when handler is called", async () => {
    console.log = jest.fn();

    const handler = new EnviaConsoleLogHandler();

    const id = "1";
    const name = "Customer 1";
    const newAddress = new Address("st 01", 3, "445500", "city 1");

    const event = new CustomerUpdatedAddressEvent({ id, name, newAddress });

    handler.handle(event);

    expect(console.log).toHaveBeenCalledWith(
      `Endereço do cliente: ${id}, ${name} alterado para: ${newAddress}`
    );
  });
});
