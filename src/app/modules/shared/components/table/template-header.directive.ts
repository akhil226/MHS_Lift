import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: '[template]'
})
export class TemplateHeaderDirective {
  @Input('template') templatename: string | unknown;
  constructor(public readonly templates: TemplateRef<any>) { }

}
