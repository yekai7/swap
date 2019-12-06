import { Component, OnInit } from '@angular/core';
import { DBService } from '../db.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  
  constructor(private dbSvc: DBService, private fb: FormBuilder) { }
  categories;
  subCategories;
  listingForm: FormGroup;

  ngOnInit() {
    this.listingForm = this.fb.group({
      listingTitle: this.fb.control('', [Validators.required]),
      listingDescription: this.fb.control(''),
      category: this.fb.control('', [Validators.required]),
      exactMatch: this.fb.control(false),
    });

    this.dbSvc.getListingCategory().then(result=>{
      console.log(result)
      this.categories = result
    }).catch(err=>{
      console.log(err)
    })
  }

  doSomething(value){
    for(const i in this.categories){
      if (this.categories[i].name == value){
        this.subCategories = this.categories[i].subCategories;
      }
    }
    console.log(this.subCategories)

  }

  processForm(form){
    console.log(form)
  }

}
