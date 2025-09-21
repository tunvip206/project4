import { Customer } from "./Customer";
import { Tour } from "./Tour";

export class Order {
    'orderId': number;
    'name': string;
    'email': string;

    'phone': string;
    'note': string;
    'address': string;
    'totalPrice': number;
    'startDate': string;
    'tour': Tour;
    'quantity': number;
    'orderTime'?: Date;

    constructor(
        orderId: number,
        name: string,
        email: string,
        phone: string,
        note: string,
        address: string,
        totalPrice: number,
        startDate: string,
        tour: Tour,
        orderTime?: Date,
        quantity?: number
    ) {
        this.orderId = orderId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.note = note;
        this.address = address;
        this.totalPrice = totalPrice;
        this.startDate = startDate;
        this.tour = tour;
        this.orderTime = orderTime;
        this.quantity = quantity || 1;
    }
}
