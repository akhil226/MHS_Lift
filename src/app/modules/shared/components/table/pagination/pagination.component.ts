import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { Dropdown } from './../../multiselect/dropdown.interface';
import { DEFAULT_ROWS_PER_PAGE, Pagination, PagionationOffset } from './pagination.interface';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() pagination: Pagination = { size: 0, page: 1, step: 1, totalCount: 0 };
  @Output() changePage = new EventEmitter<PagionationOffset>();
  @ViewChild('paginator') paginator: ElementRef<HTMLElement> | undefined;
  rowsPerPagDDl = [{ key: 10, value: '10' }, { key: 25, value: '25' }, { key: 50, value: '50' }];
  rowsPerPage = DEFAULT_ROWS_PER_PAGE;
  private listItems = '';
  constructor(
    private renderer: Renderer2
  ) { }

  ngOnInit(): void { }
  ngAfterViewInit(): void {
    this._initPagination();
  }
  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        const prop = 'pagination';
        if (propName === prop && !changes[prop].isFirstChange()) {
          this._initPagination();
        }
      }
    }
  }
  /**
   * pagination begins
   */
  private _initPagination(): void {
    if (this.pagination.totalCount) {
      this._setPaginationSize();
      this._initPaginationContainer();
      this._startpagination();
    }
  }
  private _setPaginationSize(): void {
    const size = Math.ceil(this.pagination.totalCount / +this.rowsPerPage);
    this.pagination.size = size;
  }
  /**
   * method to create the li tags with page number
   * @param start starting number
   * @param end ending number
   */
  private _addPages(start: number, end: number): void {
    let pageNo = start;
    for (pageNo; pageNo < end; pageNo++) {
      this.listItems += `<li><a>${pageNo}</a></li>`;
    }
  }
  private _addLastPageWithSeparator(): void {
    this.listItems += `<li><a>...</a></li><li><a>${this.pagination.size}</a></li>`;
    // this._addElement(this.listItems);
  }
  private _addFirstPageWithSeparator(): void {
    this.listItems += `<li><a>1</a></li><li><a>...</a></li>`;
  }
  /**
   * utility to bind elements to innerhtml
   * @param listItems the li pages string
   * @param htmlElement can pass htmlelement if needed or else the paginator is taken
   */
  private _addElement(listItems: string, htmlElement?: HTMLElement): void {
    const element = htmlElement || this.paginator?.nativeElement as HTMLElement;
    this.renderer.setProperty(element, 'innerHTML', listItems);
  }
  private _emitPagination(): void {
    const limitList = +this.rowsPerPage;
    const offsetList = (this.pagination.page - 1) * limitList;
    this.changePage.emit({ limitList, offsetList });
  }
  private _forward(count: number): void {
    if (this.pagination.page !== this.pagination.size) {
      this.pagination.page += count;
      if (this.pagination.page > (this.pagination.size as number)) {
        this.pagination.page = (this.pagination.size as number);
      }
      this._startpagination();
      //  this.changePage.emit(this.pagination);
      this._emitPagination();
    }
  }
  private _backward(count: number): void {
    if (this.pagination.page !== 1) {
      this.pagination.page -= count;
      if (this.pagination.page < 1) {
        this.pagination.page = 1;
      }
      this._startpagination();
      // this.changePage.emit(this.pagination);\
      this._emitPagination();
    }
  }
  private _next(): void {
    this._forward(1);
  }
  private _previous(): void {
    this._backward(1);
  }
  private _forwardTwoPages(): void {
    this._forward(2);
  }
  private _backwardTwoPages(): void {
    this._backward(2);
  }
  /**
   * append the li pages inside the span
   */
  private _finishPagination(): void {
    const container = this.paginator?.nativeElement.getElementsByTagName('span') as HTMLCollectionOf<HTMLElementTagNameMap['span']>;
    this._addElement(this.listItems, container[0]);
    this.listItems = '';
    this._bindPagination();
  }
  /**
   * implement the logic for showing separators between the pages
   */
  private _startpagination(): void {
    const { size = 1, page, step = 1 } = this.pagination;
    /** show full pages without separators */
    if (size < step * 2 + 5) {
      this._addPages(1, size + 1);
    }
    /** show separators at the end */
    else if (page <= step * 2 + 1) {
      this._addPages(1, step * 2 + 4);
      this._addLastPageWithSeparator();
    }
    /** show separators at the begining */
    else if (page >= size - step * 2) {
      this._addFirstPageWithSeparator();
      this._addPages(size - step * 2 - 2, size + 1);
    }
    /** show separators at the both ends */
    else {
      this._addFirstPageWithSeparator();
      this._addPages(page - step, page + step + 1);
      this._addLastPageWithSeparator();
    }
    this._finishPagination();
  }
  /**
   * method called when pagination is clicked
   * @param count the seelected value of page
   */
  private _paginationClick(count: string): void {
    if (!Number.isNaN(+count) && this.pagination.page !== +count) {
      this.pagination.page = +count;
      this._startpagination();
      // this.changePage.emit(this.pagination);
      this._emitPagination();
    }
  }
  /**
   * create click event listners to the buttons
   */
  private _bindButtonClicks(): void {
    const buttonElement = this.paginator?.nativeElement.getElementsByTagName('li') as HTMLCollectionOf<HTMLElementTagNameMap['li']>;
    this.renderer.listen(buttonElement[1], 'click', () => this._previous());
    this.renderer.listen(buttonElement[2], 'click', () => this._next());
    this.renderer.listen(buttonElement[0], 'click', () => this._backwardTwoPages());
    this.renderer.listen(buttonElement[3], 'click', () => this._forwardTwoPages());
  }
  /**
   * all the a tag insidespan container is choosen and added active class to selected element
   * also click event is added to a tag with selected page number as param
   */
  private _bindPagination(): void {
    const span = this.paginator?.nativeElement.getElementsByTagName('span') as HTMLCollectionOf<HTMLElementTagNameMap['span']>;
    const aTag = span[0].getElementsByTagName('a') as HTMLCollectionOf<HTMLElementTagNameMap['a']>;
    let i = 0;
    const aTaglength = aTag.length;
    for (i; i < aTaglength; i++) {
      if (+aTag[i].innerHTML === this.pagination.page) {
        aTag[i].className = 'active';
      }
      const pageNumber = aTag[i].innerText;
      this.renderer.listen(aTag[i], 'click', () => this._paginationClick(pageNumber));
      //  a[i].addEventListener('click', Pagination.Click, false);
    }
  }
  /**
   * create the pagination container with buttons and span to bind all the list items.
   * All the li elements should be appended inside span
   */
  private _initPaginationContainer(): void {
    const html = [
      '<li><a class="first">&laquo;</a></li>',
      '<li><a class="prev">&#8249;</a></li>',
      '<span></span>',
      '<li><a class="next">&#8250;</a></li>',
      '<li><a class="last">&raquo;</a></li>'
    ];
    //  this.listItems = html.join('');
    this._addElement(html.join(''));
    this._bindButtonClicks();
  }
  onNoOfRowChange(): void {
    if (this.rowsPerPage) {
      const size = Math.ceil(this.pagination.totalCount / +this.rowsPerPage);
      if (this.pagination.totalCount < ((this.pagination.page - 1) * +this.rowsPerPage)) {
        this.pagination = { ...this.pagination, page: size, size };
      } else {
        this.pagination = { ...this.pagination, size };
      }
      this._initPagination();
      this._emitPagination();
    }
  }
}
