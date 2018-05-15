var carm_motrek = carm_motrek || (function() {
  'use strict';

  // name of this script
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
          <td colspan='2' align='center'><h2>Momentum</h2></td>\
        </tr>\
      </thead>\
      <tbody>\
        <tr>\
          <td align='right' width='40%' style='padding-right: 1em;'><strong>Current:</strong></td>\
          <td style='padding-left: 1em;'>" + getStateVal() + "</td>\
        </tr>\
        <tr>\
          <td align='right' style='padding-right: 1em;'><strong>Max:</strong></td>\
          <td style='padding-left: 1em;'>" + getStateMaxMo() + "</td>\
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
    _sendChat("--- help ---");
    _sendChat("> !mo help -- this!");
    _sendChat("> !mo ? -- show current momentum");
    _sendChat("> !mo +# -- add # to the current momentum");
    _sendChat("> !mo -# -- subtract # from the current momentum");
    _sendChat("> !mo =# -- set momentum to #");
  }

  function validateValue() {
    var cur = getStateVal();
    var max = getStateMaxMo();

    if (cur > max) {
      var extra = cur - max;
      _sendChat("/direct Already at maximum momentum, you have <code>" + extra + "</code> bonus momentum to use.")
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

      if (!state.carm_motrek
          || !state.carm_motrek.val
          || !state.carm_motrek.maxMo
      ) {
        _sendChat("Resetting momentum data...");
        _sendChat("Old Momentum Values: " + getMoString());
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
        _error("Invalid number of parameters given, see !mo help.");
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
      }
    },
  };
}());

// register handlers
on('ready', carm_motrek.onReady);
on('chat:message', carm_motrek.onChatMessage);
