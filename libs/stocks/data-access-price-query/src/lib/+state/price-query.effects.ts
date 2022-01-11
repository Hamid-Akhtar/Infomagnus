import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
  StocksAppConfig,
  StocksAppConfigToken
} from '@coding-challenge/stocks/data-access-app-config';
import { Effect } from '@ngrx/effects';
import { DataPersistence } from '@nrwl/nx';
import { map } from 'rxjs/operators';
import {
  FetchPriceQuery,
  PriceQueryActionTypes,
  PriceQueryFetched,
  PriceQueryFetchError
} from './price-query.actions';
import { PriceQueryPartialState } from './price-query.reducer';
import { PriceQueryResponse } from './price-query.type';

@Injectable()
export class PriceQueryEffects {
  public responseCache = new Map();
  constructor(
    @Inject(StocksAppConfigToken) private env: StocksAppConfig,
    private httpClient: HttpClient,
    private dataPersistence: DataPersistence<PriceQueryPartialState>
  ) {}
  @Effect() loadPriceQuery$ = this.dataPersistence.fetch(
    PriceQueryActionTypes.FetchPriceQuery,
    {
      run: (action: FetchPriceQuery, state: PriceQueryPartialState) => {
        
        const URL = `${this.env.apiURL}/beta/stock/${action.symbol}/chart/${
          action.period
        }?token=${this.env.apiKey}`
        const fromCache = this.responseCache.get(URL);
        if (fromCache) {
          
          console.log("Retrieved from Cache")
          return fromCache;
        }
        const response = this.httpClient.get(URL).pipe(map(resp => new PriceQueryFetched(resp as PriceQueryResponse[])));
        response.subscribe(beers => {
          this.responseCache.set(URL, beers)
        });
        return response;
      },
      onError: (action: FetchPriceQuery, error) => {
        return new PriceQueryFetchError(error);
      }
    }
  );
}
