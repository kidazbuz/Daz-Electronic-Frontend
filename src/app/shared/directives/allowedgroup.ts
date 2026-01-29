import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { Auth } from '../services/auth';

@Directive({
  selector: '[appAllowedgroup]'
})
export class Allowedgroup {

  private authService = inject(Auth);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  @Input() set appAllowedgroup(groupNames: string | string[]) {
    const groups = Array.isArray(groupNames) ? groupNames : [groupNames];
    
    const hasAccess = groups.some(group => this.authService.userInGroup(group));

    if (hasAccess) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

}
