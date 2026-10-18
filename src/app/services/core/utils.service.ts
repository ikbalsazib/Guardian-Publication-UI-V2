import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(
    @Inject(DOCUMENT) private document: Document
  ) {
  }


  /**
   * UTILS
   */

  getDateString(date: Date, format?: string): string {
    const fm = format ? format : 'YYYY-MM-DD';
    return moment(date).format(fm);
  }

  getDateDifference(startDate: Date, endDate: Date): number {
    const a = moment(startDate, 'M/D/YYYY');
    const b = moment(endDate, 'M/D/YYYY');

    return a.diff(b, 'minutes');
  }

  roundNumber(num: number): number {
    const integer = Math.floor(num);
    const fractional = num - integer;

    // Converting the fractional to the integer
    const frac2int = (fractional * 100) / 5;
    const fracCeil = Math.fround(frac2int);

    // Transforming inter into fractional
    const FracOut = (fracCeil * 5) / 100;
    const ans = integer + FracOut;

    return Number((Math.round(ans * 100) / 100).toFixed(2));
  }

  /**
   * GET RANDOM NUMBER
   */
  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  // REGEX SEARCH VARIABLE
  searchWithRegex = (collection: any[], term: string, opts: { caseSensitive: boolean, includedKeys: string[] }) => {
    const filterBy = () => {
      const searchTerms = (!opts.caseSensitive) ? new RegExp(term, 'i') : new RegExp(term)
      return (obj: any) => {
        for (const key of Object.keys(obj)) {
          if (searchTerms.test(obj[key]) &&
            opts.includedKeys.includes(key)) return true
        }
        return false
      }
    }
    return collection.filter(filterBy())
  }

  randomDataArray<T>(data: T[], length: number): T[] {
    const finalArray: T[] = [];
    for (let i = 0; i < length; i++) {
      let randomNumber = this.getRandomInt(0, (data.length - 1));
      finalArray.push(data[randomNumber]);
    }
    return finalArray;
  }
  
  /**
   * VALIDATE EMAIL
   */
  validateEmail(email: string): boolean {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  /**
   * LOGIN USERNAME FORM USER
   */
  checkUserLoginInput(text: string): boolean {
    const isEmail = this.validateEmail(text);
    const re = /^[0-9]*$/;
    const isNumber = re.test(text);
    return isEmail || isNumber;
  }

  checkValidPhone(phoneNo: string): boolean {
    const re = /^[0-9]*$/;
    return re.test(phoneNo);
  }

  getImageName(originalName: string): string {
    const array = originalName.split('.');
    array.pop();
    return array.join('');
  }


  getHostBaseUrl(): string {
    return new URL(this.document.location.href).origin;
  }

}
