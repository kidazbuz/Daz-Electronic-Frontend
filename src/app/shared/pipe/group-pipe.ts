import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PurchaseOrder, OrderGroup } from '../interfaces/purchasing-data';


@Pipe({
  name: 'group'
})
export class GroupPipe implements PipeTransform {

  constructor(private datePipe: DatePipe) {}

    transform(purchaseOrders: PurchaseOrder[] | null | undefined): OrderGroup[] {
        if (!purchaseOrders || purchaseOrders.length === 0) {
            return [];
        }

        const today = new Date();

        const groupedMap = new Map<string, PurchaseOrder[]>();

        purchaseOrders.forEach(po => {

            const poDate = po.po_date ? new Date(po.po_date) : new Date();
            let groupKey: string;


            if (poDate.getFullYear() === today.getFullYear() && poDate.getMonth() === today.getMonth()) {
                groupKey = "Current Month";
            }

            else {

                const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);

                if (poDate.getFullYear() === lastMonthDate.getFullYear() && poDate.getMonth() === lastMonthDate.getMonth()) {
                    groupKey = "Last Month";
                }

                else {
                    groupKey = this.datePipe.transform(poDate, 'MMMM yyyy') || 'Other';
                }
            }

            if (!groupedMap.has(groupKey)) {
                groupedMap.set(groupKey, []);
            }
            groupedMap.get(groupKey)!.push(po);
        });

        const groupedArray: OrderGroup[] = [];

        const sortedKeys = Array.from(groupedMap.keys()).sort((a, b) => {
            if (a === "Current Month") return -1;
            if (b === "Current Month") return 1;
            if (a === "Last Month") return -1;
            if (b === "Last Month") return 1;
            const dateA = new Date(a);
            const dateB = new Date(b);
            return dateB.getTime() - dateA.getTime();
        });

        sortedKeys.forEach(key => {
            groupedArray.push({
                group: key,
                data: groupedMap.get(key) || []
            });
        });

        return groupedArray;
    }



}
