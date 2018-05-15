var carm_motrek = carm_motrek || (function() {
  'use strict';

  // name of this script and command to use
  var script_name = "carm::motrek";
  var cmd = "mo";

  // default state
  var state_shape = {
    val: 0,
    maxMo: 6,
  }

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
    return parseInt(param.substring(1), 10);
  }

  function setStateVal(val) {
    _log("set state.val to: " + val);
    state.carm_motrek.val = val;

    validateValue();
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

  function displayOriginalCommand(msg) {
    sendChat(
      "player|" + msg.playerid,
      "/direct <code>" + msg.content + "</code>"
    );
  }

  // commands
  function commHelp(p0) {
    var display = "\
      <h3> " + script_name + " Help </h3>\
      <ul>\
        <li><code>" + getCmd("help") + "</code> this!</li>\
        <li><code>" + getCmd("?") + "</code> show current momentum</li>\
        <li><code>" + getCmd("+#") + "</code> add # to the current momentum</li>\
        <li><code>" + getCmd("-#") + "</code> subtract # from the current momentum</li>\
        <li><code>" + getCmd("=#") + "</code> set momentum to #</li>\
      </ul>\
    ";

    sendChat("HALP PLS", "/direct " + display);
  }

  function validateValue() {
    var cur = getStateVal();
    var max = getStateMaxMo();

    if (cur > max) {
      var extra = cur - max;
      _sendChat("/direct Already at maximum momentum, you have <strong><code>" + extra + "</code></strong> bonus momentum to use.")
      setStateVal(max);

      return;
    }

    if (cur < 0) {
      _sendChat("/direct Can't have less than <code>0</code> momentum, setting to 0.");
      setStateVal(0);

      return;
    }
  }

  function commSetValue(p0) {
    var val = parseParam(p0);
    setStateVal(val);

    showMoString();
  }

  function commAddValue(p0) {
    var val = parseParam(p0);
    setStateVal(getStateVal() + val);

    showMoString();
  }

  function commSubValue(p0) {
    var val = parseParam(p0);
    setStateVal(getStateVal() - val);

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

      validateValue();
      showMoString();
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

      displayOriginalCommand(msg);

      var p0 = params[0].toLowerCase();

      if (p0.toLowerCase() === "help") {
        commHelp(p0);
      } else if (p0.startsWith("=")) {
        commSetValue(p0);
      } else if (p0.startsWith("+")) {
        commAddValue(p0);
      } else if (p0.startsWith("-")) {
        commSubValue(p0);
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
