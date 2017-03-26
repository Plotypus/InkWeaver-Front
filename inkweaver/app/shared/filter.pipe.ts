import { Pipe } from '@angular/core';

@Pipe({
    name: 'filter'
})
export class FilterPipe {
	transform(items: any[], text: any): any {
		// filter items array, items which match and return true will be kept, false will be filtered out
		return items.filter(item => item.label.indexOf(text) !== -1);
	}
}
