import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Order } from '../common/Order';

@Injectable({
    providedIn: 'root'
})
export class OrderService {

    urlCart = 'http://localhost:8080/api/orders';

    constructor(private httpClient: HttpClient) { }

    getOrder() {
        return this.httpClient.get(this.urlCart)
    }

    post(order: Order,) {
        console.log('🟡 Order gửi lên:', JSON.stringify(order));

        return this.httpClient.post(this.urlCart, order);

    }

}
