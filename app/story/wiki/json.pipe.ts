import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "Json",
})
export class JsonPipe implements PipeTransform {
  transform(text: any): any {
    // filter items array, items which match and return true will be kept, false will be filtered out
    return JSON.stringify(text);
  }
}
