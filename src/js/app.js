App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("Infection.json", function (infection) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Infection = TruffleContract(infection);
      // Connect provider to interact with contract
      App.contracts.Infection.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function () {
    App.contracts.Infection.deployed().then(function (instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function (error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },

  render: function () {
    var infectionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data

    App.contracts.Infection.deployed().then(function (instance) {
      infectionInstance = instance;
      return infectionInstance.addressesCount();
      
    }).then(function (addressesCount) {
      var infected = $("#infectedPeopleResult");
      infected.empty();

      // var candidatesSelect = $('#candidatesSelect');
      // candidatesSelect.empty();
      var lastKey = '';

      for (var i = 0; i < addressesCount; i++) {
        var cnt = 1;
        infectionInstance.addreses(i).then(function (address) {
          console.log(address);
          // var name = candidate[1];
          infectionInstance.infectedPeople(address).then(function (key) {
            console.log(key);
            if(key != lastKey){
              if(key != ''){
                var infectedPersonTemplate = "<tr><th>" + cnt + "</th><td>"  + key + "</td></tr>"
                infected.append(infectedPersonTemplate);
                cnt++;
                lastKey = key;
              }
            }
            // Render candidate Result
          })
          // Render candidate ballot option
          // var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          // candidatesSelect.append(candidateOption);
        });
      }
      return infectionInstance.alreadyInfected(App.account);
    }).then(function (isInfected) {
      // Do not allow a user to vote
      if (isInfected) {
        $('#add').hide();
      } else {
        $('#remove').hide();
      }
      loader.hide();
      content.show();
    }).catch(function (error) {
      console.warn(error);
    });
  },

  addInfected: function () {

    function makeid(length) {
      var result = '';
      var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }

    var infectedPersonId = makeid(15);
    App.contracts.Infection.deployed().then(function (instance) {
      return instance.addMe(infectedPersonId, new Date().getTime(), {
        from: App.account
      });
    }).then(function (result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function (err) {
      console.error(err);
    });
  },

  removeInfected: function () {

    var nez = 'sfs';
    App.contracts.Infection.deployed().then(function (instance) {
      return instance.removeMe(nez, {
        from: App.account
      });
    }).then(function (result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function (err) {
      console.error(err);
    });
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});