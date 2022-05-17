import { Component, Input, OnInit, SimpleChanges, OnChanges, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Dropdown, DropDownData } from './dropdown.interface';

@Component({
  selector: 'app-multiselect[dropdown]',
  templateUrl: './multiselect.component.html',
  styleUrls: ['./multiselect.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: MultiselectComponent
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiselectComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() dropdown: Dropdown | undefined;
  dropdownList: any = [];
  selectedItems: any = [];
  placeholder = '';
  dropdownSettings: IDropdownSettings;
  touched = false;
  disabled = false;
  onTouched = () => { };
  onChange = (id: string | number | Array<number | string>) => { };
  constructor(
    private cdref: ChangeDetectorRef
  ) {
    this.dropdownSettings = {
      idField: 'key',
      textField: 'value',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
      searchPlaceholderText: 'Search'
    };
  }
  ngOnInit(): void {
    this.selectedItems = [];
  }
  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        if (propName === 'dropdown') {
          this.dropdownSettings.singleSelection = !this.dropdown?.multi;
          this.placeholder = this.dropdown?.placeholder || 'Select';
          this.dropdownSettings.closeDropDownOnSelection = !this.dropdown?.multi || true;
          this.dropdownList = this.dropdown?.data;
          this.dropdownSettings.searchPlaceholderText = this.dropdown?.searchPlaceholderText || 'Search';
          this.dropdownSettings.allowSearchFilter = this.dropdown?.allowSearchFilter ?? true;
        }
      }
    }
  }
  // validate(control: AbstractControl): ValidationErrors | null {
  //   const value = control.value;
  //   if (!this.dropdown?.multi) {
  //     if (!value) {
  //       return {
  //         mustBePositive
  //       }
  //     }
  //   }
  // }
  writeValue(id: Array<string | number> | number | string): void {
    if (!this.dropdown?.multi) {
      const selectedMetadata = this.dropdown?.data.find(({ key }) => key === id);
      this.selectedItems = selectedMetadata ? [selectedMetadata] : [];
      this.cdref.detectChanges();
    } else {
      if (id) {
        const ids = id as Array<number | string>;
        const data = this.dropdown?.data || [];
        const selectedMetadata = ids?.reduce((acc, cur) => acc.concat(data.filter(({ key }) => key === cur)), [] as Array<any>);
        this.selectedItems = selectedMetadata;
        this.cdref.detectChanges();
      }
    }
  }
  registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }
  registerOnTouched(onTouched: any): void {
    this.onTouched = onTouched;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
  onSelectAll(item: any): void {
    this.markAsTouched();
    const selectedIds = item?.map((val: any) => val.key) || [];
    this.onChange(selectedIds);
  }
  onDeSelectAll(): void {
    this.onChange([]);
  }
  onItemSelect(): void {
    this.setForm();
  }
  onDeSelect(): void {
    this.setForm();
  }
  onDataChange(){
    this.onChange([]);
  }

  setForm(): void {
    this.markAsTouched();
    if (!this.dropdown?.multi) {
      this.onChange(this.selectedItems[0]?.key  || '');
    } else {
      const selectedIds = this.selectedItems?.map((val: any) => val.key) || [];
      this.onChange(selectedIds);
    }
  }
  markAsTouched(): void {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }
}
