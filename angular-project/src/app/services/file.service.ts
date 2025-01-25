import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  public upload(formData: FormData) {
    return this.http.post(`${this.baseUrl}/file/upload`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }


  public download(fileUrl: string) {
    let params = new HttpParams();
    params = params.append('fileUrl', fileUrl);
    return this.http.get(`${this.baseUrl}/file/download`, {
      params: params,
      reportProgress: true,
      observe: 'events',
      responseType: 'blob',

    });
  }
}
