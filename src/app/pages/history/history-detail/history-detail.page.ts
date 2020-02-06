import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CasinocoinService } from '../../../providers/casinocoin.service';
import { LogService } from '../../../providers/log.service';
// import { LokiTransaction } from '../../../domains/csc-types';
import { LocalStorageService, SessionStorageService } from 'ngx-store';
import { WalletService } from '../../../providers/wallet.service';
import { AppConstants } from '../../../domains/app-constants';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { TranslateService } from '@ngx-translate/core';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { timer } from 'rxjs';

@Component({
  selector: 'app-history-detail',
  templateUrl: './history-detail.page.html',
  styleUrls: ['./history-detail.page.scss'],
})
export class HistoryDetailPage implements OnInit {

  copyIcon: string = 'copy';
  copyToIcon: string = 'copy';
  copyFromIcon: string = 'copy';
  transactionTypes: string[] = [];
  transactionLoaded:any;
  currentWalletObject:any;
  constructor(
    private walletService: WalletService,
    private activatedRoute: ActivatedRoute,
    private clipboard: Clipboard,
    private translate: TranslateService,
    private casinocoinService: CasinocoinService,
    private sessionStorageService: SessionStorageService,
    private localStorageService: LocalStorageService,
    public iab: InAppBrowser,
    private logger: LogService
  ) { }

  ngOnInit() {
    this.translate.get('PAGES.HISTORY.TRANSACTIONS').subscribe((res: string[]) => {
        this.transactionTypes = res;
        this.logger.debug('### History Detail Page :::  Transaction Types: ' + JSON.stringify(this.transactionTypes));
    });
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if(!paramMap.has('transactionId')){
        //redirect
        return;
      }else{
        const transactionId = paramMap.get('transactionId');
        this.logger.debug("History Detail Page: getting tx object: "+transactionId);
        this.transactionLoaded = this.walletService.getTransaction(transactionId);
        if(!this.transactionLoaded){

          // get the complete wallet object
          this.currentWalletObject = this.sessionStorageService.get(AppConstants.KEY_CURRENT_WALLET);
          this.logger.info('### History Detail Page: currentWallet: ' + JSON.stringify(this.currentWalletObject));
          // check if wallet is open else open it
          this.walletService.openWalletSubject.subscribe( result => {
            if (result === AppConstants.KEY_INIT) {
              this.logger.debug('### History Detail Page: Wallet INIT');
              // wallet not opened yet so open it
              this.walletService.openWallet(this.currentWalletObject.walletUUID);
            } else if (result === AppConstants.KEY_OPENING) {
              this.logger.debug('### History Detail Page: Wallet OPENING');
            } else if (result === AppConstants.KEY_LOADED) {
              this.logger.debug('### History Detail Page: Wallet LOADED');
              this.transactionLoaded = this.walletService.getTransaction(transactionId);
              this.logger.debug("History Detail Page: getting tx object: "+JSON.stringify(this.transactionLoaded));
              // this.doBalanceUpdate();
              // this.listenForMainEvents();
              // load the account list
              this.walletService.getAllAccounts().forEach( element => {
                if (element.currency === 'CSC') {
                  const accountLabel = element.label + ' - ' + element.accountID;
                  // this.accounts.push({label: accountLabel, value: element.accountID});
                }
              });
            }  else if (result === AppConstants.KEY_CLOSED) {
              this.logger.debug('### Main Page: Wallet CLOSED');
              // this.electron.ipcRenderer.send('wallet-closed', true);
            }
          });


      }else{
        this.logger.debug("History Detail Page: getting tx object: "+JSON.stringify(this.transactionLoaded));

      }


      }
    });
  }
  copyAccountID(text){
    this.clipboard.copy(text);
    this.copyIcon = 'checkmark';
    const finishTimer = timer(1000);
    finishTimer.subscribe(val =>  {
      this.copyIcon = 'copy';
    });
  }
  copyToAccountID(text){
    this.clipboard.copy(text);
    this.copyToIcon = 'checkmark';
    const finishTimer = timer(1000);
    finishTimer.subscribe(val =>  {
      this.copyToIcon = 'copy';
    });
  }
  copyFromAccountID(text){
    this.clipboard.copy(text);
    this.copyFromIcon = 'checkmark';
    const finishTimer = timer(1000);
    finishTimer.subscribe(val =>  {
      this.copyFromIcon = 'copy';
    });
  }
  getExploreURL(){
    return 'https://csc.observer/transaction/'+this.transactionLoaded.txID+'?testnet=true';
    //return  'http://testexplorer.casinocoin.org/tx/' + this.transactionLoaded.txID;
  }
  openObserverURL(){
    const link = 'https://csc.observer/transaction/'+this.transactionLoaded.txID+'?testnet=true';
    this.logger.debug('### History Detail Page:  open Observer URL : ' + link);
    this.iab.create(link, "_system");
    //return  'http://testexplorer.casinocoin.org/tx/' + this.transactionLoaded.txID;
  }

  getTXDirectionColor(tx: any) {
    if (tx.direction === AppConstants.KEY_WALLET_TX_OUT) {
      // outgoing tx
      return 'danger';
    } else if (tx.direction === AppConstants.KEY_WALLET_TX_IN) {
      // incomming tx
      return 'success';
    } else {
      // wallet tx
      return 'warning';
    }
  }

  getDirectionText(tx: any) {
    if (tx.direction === AppConstants.KEY_WALLET_TX_OUT) {
      // outgoing tx
      return this.transactionTypes["TXOUTGOING"];
    } else if (tx.direction === AppConstants.KEY_WALLET_TX_IN) {
      // incomming tx
      if (tx.transactionType === 'SetCRNRound') {
        return this.transactionTypes["TXCRNROUND"];
      } else {
        return this.transactionTypes["TXINCOMING"];
      }
    } else {
      // wallet tx
      return this.transactionTypes["TXOWN"];
    }
  }
  getDirectionIcon(tx: any) {
    if (tx.direction === AppConstants.KEY_WALLET_TX_OUT) {
      // outgoing tx
      return "icon ion-md-icon-minus";
    } else if (tx.direction === AppConstants.KEY_WALLET_TX_IN) {
      // incomming tx
      if (tx.transactionType === 'SetCRNRound') {
        return "icon icon-bancknote";
      } else {
        return "icon ion-md-icon-plus";
      }
    } else {
      // wallet tx
      return "icon icon-arrows";
    }
  }
}
