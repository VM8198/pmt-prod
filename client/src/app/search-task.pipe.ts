import { Pipe, PipeTransform,Injectable } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
	name: 'searchTask',
	// pure: false
})
@Injectable({
	providedIn: 'root'
})
export class SearchTaskPipe implements PipeTransform {

	transform(items: any[], searchText: string): any[] {

		console.log("items==>",items);
		console.log("searchtext===>",searchText);
		// return null;
		var task:any = [];
		if(!items) return [];
		if(!searchText) return items[0];
		searchText = searchText.toLowerCase();
		console.log("Search pipe items = ",items);
		task = items[0].filter( it => {


			// if(it.assignTo.name){

				if(it.title.toLowerCase().includes(searchText) || it.assignTo.name.toLowerCase().includes(searchText)  || it.uniqueId.toLowerCase().includes(searchText) || it.desc.toLowerCase().includes(searchText))
				{
					return it;
					// }
				}
			});
		// for(var i=0;i<items.length;i++){
			// }
			return task;
		}

		transform1(items: any[], searchText: string) : any[] {
			console.log("items==>",items);
			console.log("searchtext===>",searchText);
			var developer:any = [];
			if(!items) return [];
			if(!searchText) return items[0];
			searchText = searchText.toLowerCase();
			console.log("Search pipe items = ",items);
			developer = items[0].filter( it => {

				if(it.name){

					if(it.name.toLowerCase().includes(searchText)  || it.email.toLowerCase().includes(searchText) || it.userRole.toLowerCase().includes(searchText))
					{
						console.log("it ==>" , it.name);

						return it;
					}
				}
			});
			return developer;
		}
		transform2(items: any[], searchText: string) : any[] {
			console.log("items==>",items);
			console.log("searchtext===>",searchText);
			var leave:any = [];
			if(!items) return [];
			if(!searchText) return items[0];
			searchText = searchText.toLowerCase();
			console.log("Search pipe items = ",items);
			leave = items[0].filter( it => {
				// console.log("ITRETED LOOP==============>", it);

				if(it.name){

					if(it.name.toLowerCase().includes(searchText) || it.typeOfLeave.toLowerCase().includes(searchText) ){
						console.log("it ==>" , it.name);

						return it;
						
					}
				}
			});
			return leave;
		}

	}
