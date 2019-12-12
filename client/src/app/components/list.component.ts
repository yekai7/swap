import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { DBService } from '../db.service';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  constructor(private dbSvc: DBService, private fb: FormBuilder, private router: Router,
    private cookieSvc: CookieService, private _snackBar: MatSnackBar) { }

  categories;

  haveForm: FormGroup;
  haveItem: FormArray;

  wantForm: FormGroup;
  wantItem: FormArray;

  userDetail;

  ngOnInit() {
    this.dbSvc.getListingCategory().then(result => { this.categories = result })
      .catch(err => { console.log(err) })
    this.haveItem = this.fb.array([]);
    this.haveForm = this.createListingForm(this.haveItem);
    this.addItem(true);

    this.wantItem = this.fb.array([]);
    this.wantForm = this.createWantForm(this.wantItem);
    this.addItem();
  }

  addItem(mode: boolean = false) {
    if (mode)
      return this.haveItem.push(this.createListingDetail(mode));
    this.wantItem.push(this.createListingDetail(mode));
  }

  removeItem(idx, mode = false) {
    if (mode)
      return this.haveItem.removeAt(idx);
    this.wantItem.removeAt(idx);
  }

  private createListingDetail(mode): FormGroup {
    if (mode) {
      return (this.fb.group({
        listingTitle: this.fb.control('', [Validators.required]),
        listingDescription: this.fb.control(''),
        category: this.fb.control('', [Validators.required]),
        listingSubCat: this.fb.control(null, [Validators.required])
      }))
    }
    return (this.fb.group({
      listingTitle: this.fb.control(''),
      category: this.fb.control('', [Validators.required]),
      listingSubCat: this.fb.control(null, [Validators.required])
    }))

  }

  private createListingForm(ld: FormArray = null): FormGroup {
    return (
      this.fb.group({
        exactMatch: this.fb.control(false),
        haveItem: ld || this.fb.array([], Validators.required)
      })
    )
  }

  private createWantForm(ld: FormArray = null): FormGroup {
    return (
      this.fb.group({
        wantItem: ld || this.fb.array([], Validators.required)
      })
    )
  }

  processListing(undecided = true) {
    const user = JSON.parse(this.cookieSvc.get('userDetail'));
    let listing = {
      listingBy: user.email,
      openToAll: undecided,
      exactMatch: this.haveForm.value.exactMatch,
      listDate: new Date().getTime(),
      haveItem: []
    }
    for (let i = 0; i < this.haveItem.length; i++) {
      const fg: FormGroup = this.haveItem.controls[i] as FormGroup;
      listing.haveItem.push(fg.value)
    }
    if (!undecided) {
      listing['wantItem'] = [];
      for (let i = 0; i < this.wantItem.length; i++) {
        const fg: FormGroup = this.wantItem.controls[i] as FormGroup;
        listing['wantItem'].push(fg.value)
      }
    }

    this.dbSvc.postListing(listing).then(result => {
      this._snackBar.open('Listing have been added.', 'dismiss', {
        duration: 3000,
      });
      this.router.navigate(['/match']);
    }).catch(err => {
      console.log(err);
    })
  }

  getSubCategory(event) {
    for (const i in this.categories) {
      if (this.categories[i].name == event.value)
        return this.categories[i].subCategories;
    }
  }
}
