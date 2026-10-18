import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  inject,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule} from "@angular/forms";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import { CommonModule } from '@angular/common';
import { Dropdown } from "../dropdown/interfaces/dropdown.interface";
import { DropdownModule } from '../dropdown/dropdown.module';

@Component({
  selector: 'app-html-editor',
  templateUrl: './html-editor.component.html',
  styleUrls: ['./html-editor.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, DropdownModule],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HtmlEditorComponent),
      multi: true,
    },
  ],
})
export class HtmlEditorComponent implements OnInit, AfterViewInit, ControlValueAccessor, OnDestroy {
  // Main Editor
  @ViewChild('editor', {static: true}) editor!: ElementRef;

  // Color
  @ViewChild('colorPickerDropdown') colorPickerDropdown!: ElementRef;

  // link
  @ViewChild('linkMenu') linkMenu!: ElementRef;
  private selectedLink: HTMLElement | null = null;


  // Image
  @ViewChild('imageController') imageController!: ElementRef;
  @ViewChild('imageControllerOtp') imageControllerOtp!: ElementRef;
  private selectedImage: HTMLImageElement | null = null;
  private resizeHandle: string | null = null;
  private initialMouseX: number = 0;
  private initialMouseY: number = 0;
  private initialImageWidth: number = 0;
  private initialImageHeight: number = 0;

  // Toggle
  currentTextStyle: string[] = [];
  currentTextColor: string = '#000000';

  // Inject
  private renderer = inject(Renderer2);
  private readonly dialog = inject(MatDialog);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);


  // Data
  readonly typography: Dropdown[] = [
    {value: 'p', viewValue: 'Paragraph', class: 'font-size-12'},
    {value: 'h6', viewValue: 'Heading 6', class: 'font-size-16'},
    {value: 'h5', viewValue: 'Heading 5', class: 'font-size-18'},
    {value: 'h4', viewValue: 'Heading 4', class: 'font-size-20'},
    {value: 'h3', viewValue: 'Heading 3', class: 'font-size-24'},
    {value: 'h2', viewValue: 'Heading 2', class: 'font-size-30'},
    {value: 'h1', viewValue: 'Heading 1', class: 'font-size-34'},
  ];

  readonly fontSizes: Dropdown[] = [
    {value: '14px', viewValue: '14px', class: 'font-size-14'},
    {value: '16px', viewValue: '16px', class: 'font-size-16'},
    {value: '18px', viewValue: '18px', class: 'font-size-18'},
    {value: '24px', viewValue: '24px', class: 'font-size-24'},
    {value: '32px', viewValue: '32px', class: 'font-size-32'},
    {value: '36px', viewValue: '36px', class: 'font-size-36'},
    {value: '48px', viewValue: '48px', class: 'font-size-48'},
    {value: '56px', viewValue: '56px', class: 'font-size-56'},
    {value: '48px', viewValue: '48px', class: 'font-size-48'},
  ];

  readonly textAligns: Dropdown[] = [
    {value: 'left', viewValue: 'Left', class: 'font-size-14'},
    {value: 'center', viewValue: 'Center', class: 'font-size-14'},
    {value: 'right', viewValue: 'Right', class: 'font-size-14'},
  ];

  // Complex auto-detect the editor changes
  private observer!: MutationObserver;
  private onChange: ((value: string) => void) | null = null;
  private onTouched: (() => void) | null = null;



  ngOnInit() {
    if (this.isBrowser) {
      // Listen for click events on the document to hide the image controller
      this.renderer.listen('document', 'click', (event) => {
        this.onDocumentClick(event);
      });

      // Listen for keydown events for Delete or Backspace
      this.renderer.listen('document', 'keydown', (event) => {
        this.onKeyDown(event);
      });
    }

    // auto-detect the editor changes
    this.observer = new MutationObserver(() => {
      this.onEditorContentChange();
    });
  }


  ngAfterViewInit() {
    if (this.editor) {
      // Listen for the keydown event to handle Enter key inside blockquote
      this.renderer.listen(this.editor.nativeElement, 'keydown', (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          this.handleEnterInBlockquote(event);
        }
      });

      this.observer.observe(this.editor.nativeElement, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      // Add click event listener to images
      this.addImageClickListener();
    }
  }


  /**
   * Text Format
   */
  formatText(command: string) {
    document.execCommand('formatBlock', false, command);
  }

  formatListText(command: string) {
    document.execCommand(command, false, '');
  }

  formatTextStyle(command: string) {
    document.execCommand(command, false);

    const exists = this.currentTextStyle.includes(command);
    if (exists) {
      this.currentTextStyle = this.currentTextStyle.filter(item => item !== command);
    } else {
      this.currentTextStyle.push(command)
    }
  }

  alignText(alignment: string) {
    document.execCommand('justify' + alignment, false, '');
  }


  changeFontSize(size: string) {
    document.execCommand('fontSize', false, '7');
    const elements = this.editor.nativeElement.querySelectorAll('font[size="7"]');
    elements.forEach((element: HTMLElement) => {
      element.removeAttribute('size');
      element.style.fontSize = size;
    });
  }

  /**
   * Color Control
   */

  changeTextColor(event: Event) {
    const color = (event.target as HTMLInputElement).value;
    this.currentTextColor = color;
    document.execCommand('foreColor', false, color);
  }

  changeBackgroundColor(event: Event) {
    const color = (event.target as HTMLInputElement).value;
    document.execCommand('hiliteColor', false, color);
  }

  toggleColorPickers(event: Event) {
    event.stopPropagation();
    const dropdown = this.colorPickerDropdown.nativeElement;
    if (dropdown.style.display === 'none' || !dropdown.style.display) {
      dropdown.style.display = 'flex';
    } else {
      dropdown.style.display = 'none';
    }
  }

  hideColorPickers() {
    if (this.colorPickerDropdown) {
      this.colorPickerDropdown.nativeElement.style.display = 'none';
    }
  }

  /**
   * Blockquote Control
   */

  toggleBlockquote() {
    if (!this.isBrowser) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;
    const blockquote = this.findAncestor(commonAncestor, 'blockquote');

    if (blockquote) {
      this.removeBlockquote(blockquote);
    } else {
      this.addBlockquote(range);
    }
  }


  handleEnterInBlockquote(event: KeyboardEvent) {
    if (!this.isBrowser) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const blockquote = this.findAncestor(range.commonAncestorContainer, 'blockquote');

    if (blockquote) {
      event.preventDefault(); 

      range.setStartAfter(blockquote);
      range.setEndAfter(blockquote);
      selection.removeAllRanges();
      selection.addRange(range);

      const newParagraph = document.createElement('p');
      newParagraph.innerHTML = '<br>';
      blockquote.parentNode?.insertBefore(newParagraph, blockquote.nextSibling);

      range.setStart(newParagraph, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  findAncestor(node: Node, tagName: string): HTMLElement | null {
    let curr: Node | null = node;
    while (curr) {
      if (curr.nodeType === Node.ELEMENT_NODE && (curr as HTMLElement).tagName.toLowerCase() === tagName.toLowerCase()) {
        return curr as HTMLElement;
      }
      curr = curr.parentNode;
    }
    return null;
  }

  addBlockquote(range: Range) {
    const blockquote = this.renderer.createElement('blockquote');
    range.surroundContents(blockquote);
    this.applyBlockquoteStyle(blockquote);
  }

  removeBlockquote(blockquote: HTMLElement) {
    const parent = blockquote.parentNode!;
    while (blockquote.firstChild) {
      parent.insertBefore(blockquote.firstChild, blockquote);
    }
    parent.removeChild(blockquote);
  }

  applyBlockquoteStyle(blockquote: HTMLElement) {
    this.renderer.setStyle(blockquote, 'border-left', '4px solid #ccc');
    this.renderer.setStyle(blockquote, 'margin', '10px 0');
    this.renderer.setStyle(blockquote, 'padding', '10px 20px');
    this.renderer.setStyle(blockquote, 'background-color', '#f9f9f9');
    this.renderer.setStyle(blockquote, 'font-style', 'italic');
    this.renderer.setStyle(blockquote, 'color', '#555');
  }

  /**
   * Url Controller
   */
  createLink() {
    if (!this.isBrowser) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const selectedText = selection.toString().trim();
    const urlRegex = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i;

    let url: string | null = '';

    if (selectedText && urlRegex.test(selectedText)) {
      url = prompt('Enter the URL', selectedText);
    } else {
      url = prompt('Enter the URL');
    }

    if (url) {
      const range = selection.getRangeAt(0);
      const link = document.createElement('a');
      link.href = url;
      link.textContent = selectedText || url;

      link.style.display = 'inline';
      link.style.textDecoration = 'none';

      link.addEventListener('mouseover', () => {
        link.style.textDecoration = 'underline';
      });
      link.addEventListener('mouseout', () => {
        link.style.textDecoration = 'none';
      });

      range.deleteContents();
      range.insertNode(link);

      range.setStartAfter(link);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  onEditorClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName === 'A') {
      this.selectedLink = target;
      this.showLinkMenu(target);
      event.preventDefault(); 
    } else {
      this.hideLinkMenu();
    }
  }

  showLinkMenu(link: HTMLElement) {
    const rect = link.getBoundingClientRect();
    const menu = this.linkMenu.nativeElement;
    this.renderer.setStyle(menu, 'top', `${rect.bottom + window.scrollY}px`);
    this.renderer.setStyle(menu, 'left', `${rect.left + window.scrollX}px`);
    this.renderer.setStyle(menu, 'display', 'block');
  }

  hideLinkMenu() {
    if (this.linkMenu) {
      this.renderer.setStyle(this.linkMenu.nativeElement, 'display', 'none');
    }
    this.selectedLink = null;
  }

  changeLink() {
    if (this.selectedLink) {
      const url = prompt('Enter the new URL', this.selectedLink.getAttribute('href') || '');
      if (url) {
        this.selectedLink.setAttribute('href', url);
      }
      this.hideLinkMenu();
    }
  }

  removeLink() {
    if (this.selectedLink) {
      while (this.selectedLink.firstChild) {
        this.selectedLink.parentNode!.insertBefore(this.selectedLink.firstChild, this.selectedLink);
      }
      this.selectedLink.remove();
      this.hideLinkMenu();
    }
  }

  /**
   * Image Control Methods
   */
  onImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const img = document.createElement('img');
        img.src = e.target!.result as string;
        img.style.maxWidth = '100%';
        img.style.position = 'relative';
        img.contentEditable = 'false';
        img.addEventListener('click', (ev) => {
          ev.stopPropagation(); 
          this.selectedImage = img;
          this.showImageResizeController(img);
          this.showImageBasicController(img);
        });
        this.editor.nativeElement.appendChild(img);
        this.onEditorContentChange();
      };
      reader.readAsDataURL(input.files[0]);
    }
  }


  insertImageUrl(url: string) {
    if (url) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);

      const img = document.createElement('img');
      img.src = url;
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.contentEditable = 'false';

      img.addEventListener('click', (ev) => {
        ev.stopPropagation();
        this.selectedImage = img;
        this.showImageResizeController(img);
        this.showImageBasicController(img);
      });

      range.deleteContents();
      range.insertNode(img);

      range.setStartAfter(img);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      this.onEditorContentChange();
    }
  }


  showImageBasicController(img: HTMLElement) {
    const rect = img.getBoundingClientRect();
    const controller = this.imageControllerOtp.nativeElement;
    this.renderer.setStyle(controller, 'top', `${rect.top + window.scrollY}px`);
    this.renderer.setStyle(controller, 'left', `${rect.right + window.scrollX + 10}px`);
    this.renderer.setStyle(controller, 'display', 'block');
  }

  showImageResizeController(img: HTMLElement) {
    const rect = img.getBoundingClientRect();
    const controller = this.imageController.nativeElement;
    this.renderer.setStyle(controller, 'top', `${rect.top + window.scrollY}px`);
    this.renderer.setStyle(controller, 'left', `${rect.left + window.scrollX}px`);
    this.renderer.setStyle(controller, 'width', `${rect.width}px`);
    this.renderer.setStyle(controller, 'height', `${rect.height}px`);
    this.renderer.setStyle(controller, 'display', 'block');

  }

  addImageClickListener() {
    const images = this.editor.nativeElement.querySelectorAll('img');
    images.forEach((img: HTMLImageElement) => {
      img.addEventListener('click', (event: MouseEvent) => {
        event.stopPropagation();
        this.selectedImage = img;
        this.showImageResizeController(img);
        this.showImageBasicController(img);
      });
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if ((event.key === 'Delete' || event.key === 'Backspace') && this.selectedImage) {
      this.selectedImage.remove();
      this.selectedImage = null; 

      this.renderer.setStyle(this.imageController.nativeElement, 'display', 'none');
      this.renderer.setStyle(this.imageControllerOtp.nativeElement, 'display', 'none');

      event.preventDefault(); 
      this.onEditorContentChange();
    }
  }

  resizeImage() {
    if (this.selectedImage) {
      const size = prompt('Enter the new width (px or %):', '100%');
      if (size) {
        (this.selectedImage as HTMLImageElement).style.width = size;
        this.showImageBasicController(this.selectedImage);
      }
    }
    this.onEditorContentChange();
  }

  alignImage(alignment: string) {
    if (this.selectedImage) {
      switch (alignment) {
        case 'left':
          (this.selectedImage as HTMLImageElement).style.display = 'inline';
          (this.selectedImage as HTMLImageElement).style.float = 'left';
          break;
        case 'right':
          (this.selectedImage as HTMLImageElement).style.display = 'inline';
          (this.selectedImage as HTMLImageElement).style.float = 'right';
          break;
        case 'center':
          (this.selectedImage as HTMLImageElement).style.display = 'block';
          (this.selectedImage as HTMLImageElement).style.margin = '0 auto';
          (this.selectedImage as HTMLImageElement).style.float = 'none';
          break;
      }
      this.showImageResizeController(this.selectedImage); 
      this.showImageBasicController(this.selectedImage); 
    }
    this.onEditorContentChange();
  }

  deleteImage() {
    if (this.selectedImage) {
      this.selectedImage.remove();
      this.selectedImage = null;
      this.renderer.setStyle(this.imageControllerOtp.nativeElement, 'display', 'none');
      this.onEditorContentChange();
    }
  }

  onResizeStart(event: MouseEvent, handle: string) {
    if (!this.selectedImage) return;
    this.resizeHandle = handle;
    this.initialMouseX = event.clientX;
    this.initialMouseY = event.clientY;
    this.initialImageWidth = this.selectedImage.offsetWidth;
    this.initialImageHeight = this.selectedImage.offsetHeight;

    this.renderer.listen('document', 'mousemove', this.onResizing.bind(this));
    this.renderer.listen('document', 'mouseup', this.onResizeEnd.bind(this));
    event.stopPropagation();
  }

  onResizing(event: MouseEvent) {
    if (!this.selectedImage || !this.resizeHandle) return;
    let deltaX = event.clientX - this.initialMouseX;
    let deltaY = event.clientY - this.initialMouseY;

    switch (this.resizeHandle) {
      case 'top-left':
        this.selectedImage.style.width = `${this.initialImageWidth - deltaX}px`;
        this.selectedImage.style.height = `${this.initialImageHeight - deltaY}px`;
        break;
      case 'top-right':
        this.selectedImage.style.width = `${this.initialImageWidth + deltaX}px`;
        this.selectedImage.style.height = `${this.initialImageHeight - deltaY}px`;
        break;
      case 'bottom-left':
        this.selectedImage.style.width = `${this.initialImageWidth - deltaX}px`;
        this.selectedImage.style.height = `${this.initialImageHeight + deltaY}px`;
        break;
      case 'bottom-right':
        this.selectedImage.style.width = `${this.initialImageWidth + deltaX}px`;
        this.selectedImage.style.height = `${this.initialImageHeight + deltaY}px`;
        break;
    }

    this.showImageResizeController(this.selectedImage);
    this.showImageBasicController(this.selectedImage);
    this.onEditorContentChange();
  }

  onResizeEnd() {
    this.resizeHandle = null;
  }

  onScroll(event: WheelEvent) {
    this.onDocumentClick(event);
  }

  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    if (target.tagName !== 'IMG') {
      this.selectedImage = null;
    }

    const controller = this.imageController.nativeElement;
    if (!controller.contains(event.target as Node)) {
      this.renderer.setStyle(controller, 'display', 'none');
      this.selectedImage = null;
    }

    const controllerOpt = this.imageControllerOtp.nativeElement;
    if (!controllerOpt.contains(event.target as Node)) {
      this.renderer.setStyle(controllerOpt, 'display', 'none');
      this.selectedImage = null;
    } else {
      this.renderer.setStyle(controllerOpt, 'display', 'none');
    }

    if (!this.editor.nativeElement.contains(event.target as Node) && this.linkMenu && !this.linkMenu.nativeElement.contains(event.target as Node)) {
      this.hideLinkMenu();
    }

    if (this.colorPickerDropdown && !this.colorPickerDropdown.nativeElement.contains(event.target as Node) &&
      !(event.target as HTMLElement).classList.contains('color-picker-toggle')) {
      this.hideColorPickers();
    }
  }

  checkActiveTextStyle(command: string) {
    return this.currentTextStyle.includes(command);
  }

  writeValue(value: string): void {
    if (this.editor) {
      this.editor.nativeElement.innerHTML = value || '';
      this.addImageClickListener();
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (this.editor) {
      this.editor.nativeElement.contentEditable = !isDisabled;
    }
  }

  private onEditorContentChange(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const content = this.editor.nativeElement.innerHTML;
    if (this.onChange) {
      this.onChange(content);
    }
    if (this.onTouched) {
      this.onTouched();
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
