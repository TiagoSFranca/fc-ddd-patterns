import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerUpdatedAddressEvent from "../customer-updated-address";

export default class EnviaConsoleLogHandler
  implements EventHandlerInterface<CustomerUpdatedAddressEvent>
{
  handle(event: CustomerUpdatedAddressEvent): void {
    const { eventData } = event;

    console.log(
      `Endereço do cliente: ${eventData.id}, ${eventData.name} alterado para: ${eventData.newAddress}`
    );
  }
}
