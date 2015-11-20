// ============================================================================
// Plug-in: DMV_Online_Highscores.js 
// Version: 1.0.0
// Author: David Bow (Dekita) 
// MailTo: dekita@dekyde.com
// ============================================================================

/*:
 * @author Dekita (www.dekyde.com)
 * 
 * @plugindesc このプラグインをRPGツクールMVプロジェクトに追加すると 
 * カスタマイズ可能なハイスコアリストを表示することができます。
 * 
 * @param Score Table Name
 * @desc サーバ側に用意されたスコアリストのテーブル名。
 * @default
 *
 * @param ActorID For Name
 * @desc ここで指定したIDのアクターの名前が「名前」としてサーバに送信されます。
 * @default 1
 *
 * @param VarID For Score
 * @desc ここで指定した変数IDの値が「スコア」としてサーバに送信されます。
 * @default 1
 *
 * @param VarID For Extra
 * @desc ここで指定した変数IDの値が「追加データ」としてサーバに送信されます。
 * @default 2
 *
 * @param Window Header
 * @desc ハイスコアリスト表示ウィンドウのタイトル。
 * @default オンラインハイスコアリスト
 *
 * @help
 * ============================================================================
 * ■ System Information:
 * ============================================================================
 * Please note, most of this plugins options and customization resides within
 * the plugin code itself. 
 * 
 * The information within this sort help section is dedicated mainly to the 
 * Event Command 'Plugin Commands'. 
 * 
 * Plugin commands are as follows; 
 * 
 * highscore view LISTNAME
 * highscore add LISTNAME
 * 
 * Example, choose 'plugin command' in the event command selection screen,
 * from there, type in the box one of the plugin commands for this system.
 * In this example, that would be either 'highscore view LISTNAME', or
 * 'highscore add LISTNAME' - where LISTNAME is a valid list identifier. 
 * 
 * This system then decides how to respond to your command :-
 * For viewing a list, it will obtain the list data and return it to be
 * processed by the highscore scene. 
 * 
 * However, for adding a new highscore things are a little different - or
 * rather, they are no different at all, which may not be how you might 
 * expect as this process does not allow you to specify a new highscore entry.
 *  
 * The system works as follows;
 * - Receives command 
 * - Checks command type (view or add)
 * - Ensures LISTNAME is a valid list identifier
 * - Setup data to be entered as the new highscore entry (if adding score)
 * - Send the data to the server to be processed
 * - Returns data from the server to be processed by this system
 * 
 * This may leave you wondering - how does the system know what to use for
 * the name, and score, within my new highscore entries that are added..
 * The answer to that is simple - YOU decide them in advance. :D
 * 
 * Customization settings in the form of string formulas allow for code to 
 * be predetermined and 'evaluated' as and when the system requires it. 
 * This allows for the system to easily utilize any available variable
 * (within a global scope) to determine the name and score values.
 * 
 * Additionally, this system boasts the use of an 'Extra' data slot.
 * This could be used to display extra information within the highscore scene.
 * 
 * For example, you may have a highscore list to show the highest damage dealt
 * to some boss enemy. Using the extra data slot - and your own programming 
 * expertise - you could hold record, and display the skill that was used to 
 * deal that unbelievable damage value. 
 * 
 * ============================================================================
 * ■ Terms && Conditions:
 * ============================================================================
 * This plugin is completely free to use, both commercially and privately -
 * Providing the following copy is shown within the project credits;
 * 
 * Copyright (C) 2015 - Dekyde Studios 
 * Dekyde Studios Developer: Dekita - dekita(at)dekyde.com 
 * 
 * Additionally, this header should remain intact at all times.
 * 
 * You are not allowed to redistribute this plugin directly. 
 * Instead, please provide a link to the following website;
 * www.dekyde.com
 * 
 * ============================================================================
 * ■ Financial Contributions:
 * ============================================================================
 * If you like my work and want to see more of it in the future, I ask that you 
 * consider offering a financial donation. 
 * 
 * Most of the plugins I write are free to use commercially, and many hours of
 * work go into each and every one - not including the time spent bug hunting
 * and performing optimization modifications. 
 * 
 * If you do wish to provide your support, you can do so at the following link;
 * www.patreon.com/Dekita
 * 
 * ============================================================================
 * ■ Stay Up To Date:
 * ============================================================================
 * I advise that you check regularly to see if any of the plugins you use
 * have been updated. The plugin updates will include things like bugfixes and
 * new features, so it is highly recommended. 
 * 
 * You can get the latest versions of my Mv plugins from www.dekyde.com/dmv
 * 
 * ============================================================================
 *  www.dekyde.com
 * ============================================================================
 */ 


/**
 * DMVプラグインのチェック、使用可能ならそこにプラグインを登録。
 */
(function(){
  if (typeof DMV === 'undefined') {
    var strA = "このDMVプラグインを使用するにはMV_Commonsと ";
    var strB = "DMV_Coreプラグインを追加する必要があります！";
    throw new Error(strA + strB);
  }else{
    DMV.register("Online_Highscores", "1.0.0", "13/1o/2o15");
  }
})();

/**
 * 無名関数(DMV) 
 */
(function($){
  /**
   * strict mode使用でコードスメルを強く
   */
  "use strict";

  /**\\\\\\\\\\\\\\\\\\\\\\\\\\\
   * カスタマイズセクションここから
   **///////////////////////////

  /**
   * host (string)
   * 
   * phpファイルとsqlデータベースを保持しているウェブサイトのアドレス。
   * このシステムはここで指定されたサイトと通信を行います。
   * localhostであってもhttp(s?)://を含めてください。
   */ 
  var host = "http://dekyde.com/dmv-osohigh/";

  /**
   * keys (object)
   * 
   * ホストに送られるリクエストのタイプ。
   * @param add_new (string): 新たなスコアを送信するときに使われるキーワード。
   * @param get_all (string): リストデータを受信するときに使われるキーワード。
   */ 
  var keys = {add_new:'add', get_all:'get'};

  /**
   * default_position (object)
   * 
   * @param x (string): ウィンドウのx位置。
   * @param y (string): ウィンドウのy位置。
   * @param w (string): ウィンドウの幅。
   * @param h (string): ウィンドウの高さ。
   * 
   * @note arguments[0]は幅、高さのどちらかの値を持ちます。
   *  x位置の場合はウィンドウの幅の値を持ち、
   *  y位置の場合はウィンドウの高さの値を持ちます。
   *  これはウィンドウを画面中心に表示するためのものです。
   */
  var default_position = {
    x: "Graphics.boxWidth/2-(arguments[0]/2)",
    y: "Graphics.boxHeight/2-(arguments[0]/2)",
    w: "Graphics.boxWidth/2",
    h: "this.lineHeight()*10",
  };

  /**
   * default_scorename, default_score, default_extra, default_head, tableName (string)
   * 
   * これらの文字列は、どの変数を使って新しいハイスコアのエントリーが
   * 行われるかを定義します。
   */
  var parameters        = PluginManager.parameters("DMV_Online_Highscores");
  var tableName         = parameters['Score Table Name'];
  var default_head      = parameters['Window Header'];
  var default_scorename = "$gameActors.actor("+parameters['ActorID For Name']+").name()";
  var default_score     = "$gameVariables.value("+parameters['VarID For Score']+")";
  var default_extra     = (parameters['VarID For Extra'] !== "0")? "$gameVariables.value("+parameters['VarID For Extra']+")" : "''";

  /**
   * highscore_lists (object)
   * 
   * この配列の各要素はハイスコアリストのデータオブジェクトです。
   * これらのオブジェクトは、ハイスコアシーンでどのデータを
   * どう表示するかを定義しています。
   * 
   * @param head (string): リストの表題を定義する文字列。
   * @param posi (object): default_positionを見てください。
   * @param post (object): 以下を参照してください;
   * @param post.sname (string): 新しいハイスコア名。
   * @param post.score (string): 新しいハイスコア。
   * @param post.extra (string): 新しい追加データ。
   * @note 追加データのフィールドに"''"を入れて空文字が入っていることを保証します(不使用の時に必要)。
   */
  var highscore_lists = {
    // 
    // List Identifier: Test
    // 
    "Test": { 
      head: 'Test List',
      posi: default_position,
      post: {
        sname: default_scorename,
        score: "$gameVariables.value(1)",
        extra: "''",
      },
    },
    // 
    // List Identifier: DefaultList1
    // 
    "DefaultList1": { 
      head: 'My Highscore List',
      posi: default_position,
      post: {
        sname: default_scorename,
        score: "$gameVariables.value(1)",
        extra: "''",
      },
    },
    // 
    // List Identifier: DefaultList2
    // 
    "DefaultList2": {
      head: 'Example List 2',
      posi: default_position,
      post: {
        sname: default_scorename,
        score: "$gameVariables.value(2)",
        extra: "''",
      },
    },
    // 
    // List Identifier: DefaultList3
    // 
    "DefaultList3": { 
      head: 'Example List 3',
      posi: default_position,
      post: {
        sname: default_scorename,
        score: "$gameVariables.value(3)",
        extra: "''",
      },
    },
    // 
    // More lists go here
    // 
  };
  
  //List Identifier: パラメータ'Score Table Name'で定義されたテーブル名。
  highscore_lists[tableName] = {
    head: default_head,
    posi: default_position,
    post: {
      sname: default_scorename,
      score: default_score,
      extra: default_extra
    }
  };


  /**\\\\\\\\\\\\\\\\\\\\\\\\\
   * カスタマイズセクションここまで。
   **/////////////////////////


  /**\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
   * DMV.HTTP Variables && Functions
   **///////////////////////////////
  (function(http) {
    /**
     * DMV.HTTP.getHighscores(listID, funk, thisObj)
     * @param listID apiに送るユニークなリストID。
     * @param funk 処理が終了した時に呼ばれる関数。
     * @param thisObj funcの'this'引数として渡されるオブジェクト。
     * @return listIDが無効な場合のみfalseを返します。
     */
    http.getHighscores = function(listID, funk, thisObj){
      if (!highscore_lists[listID]){return false};
      var data = 'data=' + keys.get_all +"/" + listID;
      DMV.HTTP.postAsync(host,data,funk,thisObj);
    };
    /**
     * DMV.HTTP.postHighscore(listID, name, score, extra)
     * @param listID apiに送るユニークなリストID。
     * @param name 新しいエントリーの名前。
     * @param score 新しいエントリーのスコア。
     * @param extra 新しいエントリーの追加データ。
     * @return listIDが無効な場合のみfalseを返します。
     */
    http.postHighscore = function(listID, name, score, extra){
      if (!highscore_lists[listID]){return false};
      var post = 'data=' + keys.add_new +"/" + listID + '/';
      post = post + name + ',' + score + ',' + extra;
      DMV.HTTP.postAsync(host,post, function(replystring){
        console.log(replystring);
      });
    };
    /**
     * DMV.HTTP宣言ここまで。
     */
  })($.HTTP);


  /**\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
   * Game_Interpreter Variables && Functions
   **///////////////////////////////////////
  (function(terp){
    /**
     * Game_Interpreter.prototype.pluginCommand(command, args)
     * プラグインコマンドhighscoreの処理。
     */
    var opluginCommand = terp.pluginCommand;
    terp.pluginCommand = function(command, args) {
      if (command.contains("highscore")){
        this.highscorePluginCommand(args);
      }else{
        opluginCommand.apply(this, arguments);
      }
    };
    /**
     * Game_Interpreter.prototype.highscorePluginCommand(args)
     * プラグインコマンドhighscoreのスコア追加、表示のための処理。
     */
    terp.highscorePluginCommand = function(args) {
      switch(args[0]){
        case "view": this.openHighscoreScene(args[1]); break;
        case "add":  this.addNewHighscore(args[1]); break;
      }
    };
    /**
     * Game_Interpreter.prototype.openHighscoreScene(listID)
     * @param listID apiに送るユニークなリストID。
     * @return listIDが無効な場合のみfalseを返します。
     * listIDのリスト表示のためのハイスコアシーンを開きます。
     */
    terp.openHighscoreScene = function(listID){
      if (!highscore_lists[listID]){return false};
      SceneManager.push($.Scene.Highscore);
      SceneManager.prepareNextScene(listID);
    };
    /**
     * Game_Interpreter.prototype.addNewHighscore(listID)
     * @param listID apiに送るユニークなリストID。
     * @return listIDが無効な場合のみfalseを返します。
     * listIDのリストにハイスコアを追加。
     */
    terp.addNewHighscore = function(listID) {
      if (!highscore_lists[listID]){return false};
      var ldata = highscore_lists[listID].post;
      var sname = Function('return '+ldata.sname).apply(this);
      var score = Function('return '+ldata.score).apply(this);
      var extra = Function('return '+ldata.extra).apply(this);
      $.HTTP.postHighscore(listID, sname, score, extra);
    };
    /**
     * Game_Interpreter.prototype宣言ここまで。
     */
  })(Game_Interpreter.prototype);

  /**\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
   * DMV.Scene.Highscore Variables && Functions
   **//////////////////////////////////////////
  $.Scene.Highscore = $.extend(Scene_MenuBase);
  (function(high){
    /**
     * DMV.Scene.Highscore.prototype.initialize()
     * ハイスコアシーンのイニシャライズ。
     */
    high.initialize = function() {
      Scene_MenuBase.prototype.initialize.call(this);
    };
    /**
     * DMV.Scene.Highscore.prototype.prepare(listID)
     * ハイスコアシーンのリストを準備。
     */
    high.prepare = function(listID) {
      this._listID = listID;
    };
    /**
     * DMV.Scene.Highscore.prototype.create()
     * ハイスコアシーンの作成。 
     */
    high.create = function() {
      Scene_MenuBase.prototype.create.call(this);
      this._highwind = new $.Window.Highscore(this._listID);
      this._highwind.setHandler('cancel',this.popScene.bind(this));
      this.addWindow(this._highwind);
    };
    /**
     * DMV.Scene.Highscore.prototype宣言ここまで。
     */
  })($.Scene.Highscore.prototype);


  /**\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
   * DMV.Window.Highscore Variables && Functions
   **///////////////////////////////////////////
  $.Window.Highscore = $.extend(Window_Selectable);
  (function(high){
    /**
     * DMV.Window.Highscore.prototype.initialize(listID)
     * listIDのハイスコアウインドウのイニシャライズ。
     */
    high.initialize = function(listID) {
      var d = highscore_lists[this._listID = listID].posi;
      var w = Function('return '+d.w).apply(this);
      var h = Function('return '+d.h).apply(this);
      var x = Function('return '+d.x).apply(this,[w]);
      var y = Function('return '+d.y).apply(this,[h]);
      Window_Selectable.prototype.initialize.call(this,x,y,w,h);
      this.drawText('Loading...', 0, 0, this.contentsWidth());
      $.HTTP.getHighscores(this._listID,this.requestReturned,this)
      this.activate();
    };
    /**
     * DMV.Window.Highscore.prototype.requestReturned(replystring)
     * リストをリフレッシュするときに自動的に呼ばれます。
     */
    high.requestReturned = function(replystring){
      this.refresh(replystring.split(';'));
      console.log(replystring);
    }
    /**
     * DMV.Window.Highscore.prototype.refresh(scoreArray)
     * scoreArrayが有効なとき、ハイスコアリストをリフレッシュします。
     * もし無効なときはリストをクリアします。
     */
    high.refresh = function(scoreArray) {
      this.contents.clear();
      if (!scoreArray){ return false };
      var width = this.contentsWidth();
      var basey = this.lineHeight();
      var lname = highscore_lists[this._listID].head;
      this.drawText(lname, 0, 0, width, 'center');
      for (var i = scoreArray.length - 1; i >= 0; i--) {
        var data = scoreArray[i].split(',');
        this.drawText(data[0], 0, basey*(i+1), width, 'left');
        this.drawText(data[1], 0, basey*(i+1), width, 'right');
      };
    }
    /**
     * DMV.Window.Highscore.prototype宣言ここまで。
     */
  })($.Window.Highscore.prototype);
  /**
   * DMV宣言ここまで。
   */
})(DMV);
/**
 * End plugin
 * www.dekyde.com
 */