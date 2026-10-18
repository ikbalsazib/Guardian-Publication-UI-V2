import re

file_path = "/Users/softlabit/Documents/gurdian/Guardian-Publication-UI-2.0/src/app/pages/landing-page-3/landing-page-3.component.ts"
with open(file_path, "r") as f:
    content = f.read()

# Replace onDivisionChange declaration
content = content.replace("private onDivisionChange(id: string): void {", """onDivisionChange(event: any): void {
    const id = event?.target?.value || event;
    this.checkoutForm.get('area')?.setValue('');
    if (id) {
        this.getAreasByDivision(id);
    } else {
        this.areas.set([]);
    }""")

# Add new methods at the end of the class, before the last closing brace
new_methods = """
  showAllCombos = signal(false);
  
  toggleShowAllCombos() {
    this.showAllCombos.update(v => !v);
  }

  singleProducts = computed(() => this.products());

  addSingleProduct(product: Product) {
    this.orderMode.set('product');
    const ids = new Set(this.selectedProductIds());
    ids.add(product._id);
    this.selectedProductIds.set(ids);
  }

  clearCombo() {
    this.selectedComboIndex.set(null);
  }

  deliveryCharge = computed(() => this.hasFreeDelivery() ? 0 : this.shippingCharge());

  orderTotal = computed(() => this.orderGrandTotal());

  onAreaChange(event: any) {
    // Area changed
  }
"""

content = re.sub(r'}\s*$', new_methods + '\n}', content)

with open(file_path, "w") as f:
    f.write(content)
