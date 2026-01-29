import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class Message {

  constructor(private messageService: MessageService) {}

  showToast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) {
    this.messageService.add({
      severity,
      summary,
      detail,
      life: 5000 
    });
  }

  success(detail: string, summary: string = 'Success') {
    this.showToast('success', summary, detail);
  }

  error(detail: string, summary: string = 'Error') {
    this.showToast('error', summary, detail);
  }

  warn(detail: string, summary: string = 'Warning') {
    this.showToast('warn', summary, detail);
  }

}
