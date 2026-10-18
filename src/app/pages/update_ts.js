const fs = require('fs');
const path = require('path');

const tsPath = '/Users/softlabit/Documents/gurdian/Guardian-Publication-UI-2.0/src/app/pages/landing-page/landing-page.component.ts';
let tsContent = fs.readFileSync(tsPath, 'utf8');

// Replace orderData construction in onConfirmOrder
const orderDataOld = `const orderData = {
      name: formValue.name,
      phoneNo: formValue.phoneNo,
      shippingAddress: formValue.address,
      note: formValue.note,
      division: null,
      area: null,
      zone: null,
      carts,
      cartData,
      paymentType: formValue.paymentMethod,`;

const orderDataNew = `const orderData = {
      name: formValue.name,
      phoneNo: formValue.phoneNumber,
      shippingAddress: formValue.shippingAddress,
      note: formValue.giftMessage ? \`Gift Message: \${formValue.giftMessage}\` : '',
      division: formValue.division || null,
      area: formValue.area || null,
      zone: null,
      carts,
      cartData,
      paymentType: 'cash_on_delivery',`;

tsContent = tsContent.replace(orderDataOld, orderDataNew);

// Replace initCheckoutForm
const initOld = `private initCheckoutForm(): void {
    this.checkoutForm = this.fb.group({
      name: ['', Validators.required],
      phoneNo: ['', [Validators.required, Validators.pattern(/^(01)[3-9][0-9]{8}$/)]],
      address: ['', Validators.required],
      paymentMethod: ['cash_on_delivery', Validators.required],
      deliveryChargeType: ['inside_city', Validators.required],
      agreeTerms: [true, Validators.requiredTrue],
      note: [''],
    });

    this.subscriptions.push(
      this.checkoutForm.get('deliveryChargeType')!.valueChanges.subscribe(() => {
        this.updateShippingCharge();
      })
    );
  }`;

const initNew = `isGiftWrapSelected = signal<boolean>(false);
  giftPackagePrice = signal<number>(0);

  private initCheckoutForm(): void {
    this.checkoutForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^(?:\\+?88|0088)?01[13-9]\\d{8}$/)]],
      division: ['', Validators.required],
      area: ['', Validators.required],
      shippingAddress: ['', Validators.required],
      giftWrap: [false],
      giftMessage: [''],
      agreeTerms: [true, Validators.requiredTrue]
    });

    this.subscriptions.push(
      this.checkoutForm.get('division')!.valueChanges.subscribe(() => {
        this.updateShippingCharge();
      })
    );
    this.subscriptions.push(
      this.checkoutForm.get('giftWrap')!.valueChanges.subscribe((val) => {
        this.isGiftWrapSelected.set(val);
      })
    );
  }`;

tsContent = tsContent.replace(initOld, initNew);

const updateShippingChargeOld = `private updateShippingCharge(): void {
    const type = this.checkoutForm?.get('deliveryChargeType')?.value;
    this.shippingCharge.set(type === 'inside_city' ? 50 : 90);
  }`;

const updateShippingChargeNew = `private updateShippingCharge(): void {
    if (this.hasFreeDelivery()) {
      this.shippingCharge.set(0);
      return;
    }
    const id = this.checkoutForm?.get('division')?.value;
    const selectedDiv = this.divisions().find((d) => d._id === id);
    if (selectedDiv?.name?.toLowerCase().includes('dhaka')) {
      this.shippingCharge.set(50);
    } else {
      this.shippingCharge.set(90);
    }
  }`;

if (tsContent.includes('private updateShippingCharge(): void {')) {
  // Replace the exact block
  tsContent = tsContent.replace(updateShippingChargeOld, updateShippingChargeNew);
}

fs.writeFileSync(tsPath, tsContent);
console.log('TS updated');
