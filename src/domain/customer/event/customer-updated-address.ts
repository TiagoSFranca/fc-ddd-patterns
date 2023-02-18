import EventInterface from "../../@shared/event/event.interface";
import Address from "../value-object/address";

export default class CustomerUpdatedAddressEvent implements EventInterface {
  dataTimeOccurred: Date;
  eventData: {
    id: string;
    name: string;
    newAddress: Address;
  };

  constructor(eventData: { id: string; name: string; newAddress: Address }) {
    this.dataTimeOccurred = new Date();
    this.eventData = eventData;
  }
}
