# 巴哈姆特哈拉區 RSS feed 產生器

將巴哈姆特哈拉區的文章轉成 RSS feed，支援 Inoreader、NewsBlur、Tiny Tiny RSS 等 RSS 閱讀器。

## 如何訂閱看板

RSS feed 訂閱網址：

```
https://script.google.com/macros/s/AKfycbzypflyNrshtwbPD0awb31QWovzQeIhnv2RbV6pwRc8aHfntz1Z/exec?bsn={board_id}
```

將 `{board_id}` 替換成看板編號（可從網址取得），例如 [PS4 / PlayStation4 哈拉區](https://forum.gamer.com.tw/B.php?bsn=60596)
的編號是 60596，只要將以下網址貼到 RSS 閱讀器即可訂閱。

```
https://script.google.com/macros/s/AKfycbzypflyNrshtwbPD0awb31QWovzQeIhnv2RbV6pwRc8aHfntz1Z/exec?bsn=60596
```

## 訂閱 GNN 新聞網全文 RSS

將以下網址貼到 RSS 閱讀器：

```
https://script.google.com/macros/s/AKfycbzGqSvxyWOLfp8ADJIhuLfs8WBi4MMjgxHzPhy7zka71FCi340/exec
```

## 部署

Google Apps Script 似乎有 [Quota 限制](https://developers.google.com/apps-script/guides/services/quotas)，建議自行部署，步驟如下：

1. 到 [Google Apps Script](https://www.google.com/script/start/) 點擊 Start Scripting 開新的專案，將程式碼貼上。
1. 點擊「發佈」、「部署為網路應用程式」。
1. 具有應用程式存取權的使用者，選擇「任何人，甚至匿名使用者」。
1. 點擊「部署」，確認授權。
1. 取得應用程式網址。

## 關於

本 RSS feed 產生器在 [Google Apps Script](https://www.google.com/script/start/) 環境下執行，原始碼在 `src` 目錄下。
