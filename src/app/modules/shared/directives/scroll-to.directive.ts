import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appScrollTo]'
})
export class ScrollToDirective {
  @Input('appScrollTo') scrollTOId: HTMLElement | null = null;
  @HostListener('click', ['$event.target'])
  onClick(): void {
    this.scrollTOId?.scrollIntoView({behavior: 'smooth'});
  }
}
