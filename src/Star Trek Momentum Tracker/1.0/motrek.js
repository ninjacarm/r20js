var carm_motrek = carm_motrek || (function() {
  'use strict';

  // name of this script and command to use
  var script_name = "carm::motrek";
  var cmd = "mo";

  // set to false if not using https://github.com/Roll20/roll20-character-sheets/tree/master/Star%20Trek%20Adventures%20Official as char sheet
  var use_strek_display_template = true;

  // default state
  var state_shape = {
    val: 0,
    maxMo: 6,
  }

  // return structs
  var rsCode = 'code';
  var rsMsg = 'message';
  var retStruct = {
    rsCode: 0,
    rsMsg: '',
  };

  // logging helper methods
  function _sendChat(msg) {
    sendChat(script_name, msg);
  }

  function _log(msg) {
    log(script_name + " >> " + msg)
  }

  function _error(msg) {
    _sendChat("ERROR: " + msg);
    _log("ERROR: " + msg);
  }

  function _exception(err) {
    _error(err.message);
    _log("EXCEPTION: " + err.message + "\nSTACK: " + err.stack);
  }

  function getCmd(s) {
    return "!" + cmd + (s ? " " + s : "");
  }

  // mod state
  function parseParam(param) {
    //return parseInt(param.substring(1), 10);
    return parseAsMath(param.substring(1));
  }

  function parseAsMath(expr) {
    var chars = expr.split("");
    var n = [], op = [], index = 0, oplast = true;

    n[index] = "";

    // Parse the expression
    for (var c = 0; c < chars.length; c++) {
      if (isNaN(parseInt(chars[c])) && chars[c] !== "." && !oplast) {
        op[index] = chars[c];
        index++;
        n[index] = "";
        oplast = true;
      } else {
        n[index] += chars[c];
        oplast = false;
      }
    }

    // Calculate the expression
    expr = parseFloat(n[0]);
    for (var o = 0; o < op.length; o++) {
      var num = parseFloat(n[o + 1]);
      switch (op[o]) {
        case "+":
          expr = expr + num;
          break;
        case "-":
          expr = expr - num;
          break;
        // TODO should follow order of ops...but...meh
        case "*":
          expr = expr * num;
          break;
        case "/":
          expr = expr / num;
          break;
      }
    }
    return expr;
  }

  function setStateVal(val) {
    if (isNaN(val)) {
      _sendChat("/direct ERROR: Invalid command, please check what you wrote is valid and try again.")
      return null;
    }

    _log("set state.val to: " + val);
    state.carm_motrek.val = val;

    return validateValue();
  }

  function getStateVal() {
    _log("get state.val: " + state.carm_motrek.val);
    return state.carm_motrek.val;
  }

  function getStateMaxMo() {
    return state.carm_motrek.maxMo;
  }

  function setStateMaxMo(val) {
    state.carm_motrek.maxMo = val;
  }

  // display helpers
  function getMoString() {
    return getStateVal() + "/" + getStateMaxMo();
  }

  function showMoString() {
    if (use_strek_display_template) {
      _sendChat("&{template:strek}{{rollname=" + getStateVal() + " / " + getStateMaxMo() + "}}{{attribute=Current Momentum}}")
    } else {
      var display = "\
      <table border='1' width='100%' style='border-collapse: collapse;'>\
        <thead>\
          <tr>\
            <td colspan='4' align='center' style='background-color: #2f507c'><h3 style='color: #fff !important;'>Momentum</h3></td>\
          </tr>\
        </thead>\
        <tbody>\
          <tr>\
            <td width='30%' align='right' style='padding-right: .25em;'><strong>Current:</strong></td>\
            <td width='20%' align='center' style='background-color: #bcffc5'>" + getStateVal() + "</td>\
            <td width='30%' align='right' style='padding-right: .25em;'><strong>Max:</strong></td>\
            <td width='20%' align='center'>" + getStateMaxMo() + "</td>\
          </tr>\
        </tbody>\
      </table>\
      ";

      _sendChat("/direct " + display);
    }
  }

  function displayOriginalCommandWithResult(msg, val) {
    sendChat(
      "player|" + msg.playerid,
      // https://unicode-table.com/en/sets/arrows-symbols/
      "/direct <code>" + msg.content + "</code><strong>➔</strong><code>" + val + "</code>"
    );
  }

  function displayOriginalCommand(msg, val) {
    sendChat(
      "player|" + msg.playerid,
      "/direct <code>" + msg.content + "</code>"
    );
  }

  // commands
  function commHelp(p0) {
    var display = "\
      <pre> HALP PLS FOR " + script_name + " </pre>\
      <h4>Commands</h4>\
      <ul>\
        <li><code>" + getCmd("help") + "</code> this!</li>\
        <li><code>" + getCmd("?") + "</code> show current momentum</li>\
        <li><code>" + getCmd("+#") + "</code> add <code>#</code> to the current momentum</li>\
        <li><code>" + getCmd("-#") + "</code> subtract <code>#</code> from the current momentum</li>\
        <li><code>" + getCmd("=#") + "</code> set momentum to <code>#</code></li>\
      </ul>\
      <h4>Sample Usage</h4>\
      <ul>\
        <li><code>" + getCmd("=1") + "</code> -- overrides and sets current value to <code>1</code></li>\
        <li><code>" + getCmd("+5") + "</code> -- adds <code>5</code> to current value. If it goes over <code>" + getStateMaxMo() + "</code>, automatically displays bonus momentum.</li>\
        <li><code>" + getCmd("-3") + "</code> -- adds <code>5</code> to current value</li>\
        <li><code>" + getCmd("+-1+4-2") + "</code> -- calculates <code>-1+4-2=1</code> and adds one to current value</li>\
        <li><code>" + getCmd("-1+4-2") + "</code> -- same as above</li>\
        <li><code>" + getCmd("=-1+4-2") + "</code> -- calculate and set current value to <code>1</code></li>\
      </ul>\
    ";

    sendChat(script_name, "/direct " + display);
  }

  // returns retStruct format
  function validateValue() {
    var cur = getStateVal();
    var max = getStateMaxMo();

    if (isNaN(cur)) {
      return "ERROR: Invalid command, please check what you wrote is valid and try again.";
    }

    if (cur > max) {
      var extra = cur - max;
      setStateVal(max);

      return "Already at maximum momentum, you have <strong><code>" + extra + "</code></strong> bonus momentum to use.";
    }

    if (cur < 0) {
      setStateVal(0);

      return "Can't have less than <code>0</code> momentum, setting to 0 instead of <strong><code>" + cur + "</code></strong>.";
    }

    return null;
  }

  function displayValidateMessage(rs) {
    _log("displayValidateMessage");
    _log(rs);

    if (rs == null) {
      return;
    }

    if (rs.length > 0) {
      _log("Validate: " + rs);
      _sendChat("/direct " + rs)
      return;
    }
  }

  function commSetValue(p0, msg) {
    var val = parseParam(p0);
    var rs = setStateVal(val);

    displayOriginalCommandWithResult(msg, val);
    displayValidateMessage(rs);
    showMoString();
  }

  function commAddValue(p0, msg) {
    var val = parseParam(p0);
    var rs = setStateVal(getStateVal() + val);

    displayOriginalCommandWithResult(msg, val);
    displayValidateMessage(rs);
    showMoString();
  }

  function commDisplayValue(p0) {
    showMoString();
  }

  // public interface
  return {
    onReady: function() {
      _log("*** INIT " + script_name + " ***");

      if (!state.carm_motrek) {
        state.carm_motrek = state_shape;
        _log("Created state object.");
        _sendChat("Finished Reset.");
      }

      var rs = validateValue();
      showMoString();
      displayValidateMessage(rs);
    },

    onChatMessage: function(msg) {
      if (msg.type != "api") {
        return;
      }

      var params = msg.content.splitArgs(),
      command = params.shift().substring(1);

      if (command !== cmd) {
        return;
      }

      if (params.length != 1) {
        _error("Invalid number of parameters given, try <code>" + getCmd("help") + ".</code>");
        return;
      }

      var p0 = params[0].toLowerCase();

      if (p0.toLowerCase() === "help") {
        displayOriginalCommand(msg);
        commHelp(p0);
      } else if (p0.startsWith("=")) {
        commSetValue(p0, msg);
      } else if (p0.startsWith("+")) {
        commAddValue(p0, msg);
      } else if (p0.startsWith("-")) {
        commAddValue("+" + p0, msg);
      } else if (p0 === "?") {
        commDisplayValue(p0);
      } else {
        _error("Invalid command given <code>" + p0 + "</code>, try <code>" + getCmd("help") + ".</code>");
      }
    },
  };
}());

// register handlers
on('ready', carm_motrek.onReady);
on('chat:message', carm_motrek.onChatMessage);
