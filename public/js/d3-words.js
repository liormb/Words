
// Initialize variables
var elements = ['h1','h2','h3','h4','p','th','td','li'];
var wordsOnPage = 100;
var color = d3.scale.category20();

var excludeWords = /\b(we're|the|as|while|and|a|http|th|i|me|my|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves|he|him|his|himself|she|her|hers|herself|it|its|itself|they|them|their|theirs|themselves|what|which|who|whom|whose|this|that|these|those|am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|will|would|should|can|could|ought|i'm|you're|he's|she's|it's|we're|they're|i've|you've|we've|they've|i'd|you'd|he'd|she'd|we'd|they'd|i'll|you'll|he'll|she'll|we'll|they'll|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|don't|didn't|won't|wouldn't|shan't|shouldn't|can't|cannot|couldn't|mustn't|let's|that's|who's|what's|here's|there's|when's|where's|why's|how's|a|an|the|and|but|if|or|because|as|until|while|of|at|by|for|with|about|against|between|into|through|during|before|after|above|below|to|from|up|upon|down|in|out|on|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|say|says|said|shall|that’s)\b/ig,
    styleAndScript = /(<style>|<script>)[\s\S]*?(<\/style>|<\/script>)/g, // style or script tags
    punctuation = /[!"&()*+,-\.\/:;<=>?\[\\\]^`\{|\}~“]+/g,               // punctuation charicters
    shortWords = /\b\w{1,3}\b|[^\w\s.]/g,                                 // less than 3 char or single punctuation
    contains = /\w*\d\w*|\w*-\w*/g,                                       // contain digit or words with dash
    tags = /<[^>]*>|&(\w*);/g,                                            // tags content or html special tags
    digits = /[0-9]/g;                                                    // digits

var svgWidth  = 1440,
    svgHeight = 780,
    offsetX = 550,
    offsetY = 250;

var arrayUnique = function(arr) {
  return arr.reduce(function(p, c) {
    if (p.indexOf(c.toLowerCase()) < 0) p.push(c.toLowerCase());
    return p;
  }, []);
};

function senitizeText(arr) {
  result = [];
  for (var i=0; i < arr.length && result.length <= 500; i++) {
    var text = arr[i].innerHTML
      .replace(styleAndScript, " ")
      .replace(tags, " ")
      .replace(contains, " ")
      .replace(punctuation, " ")
      .replace(excludeWords, " ")
      .replace(shortWords, " ")
      .trim();

    if (text) result = result.concat(text.split(/\s+/));
  }
  return result;
}

function buildWordsArray(data) {
  var result = [];
  elements.forEach(function(element) {
    result = result.concat(
      senitizeText($(data).find(element))
    );
  });
  return result;
}

// getting url from the user
function getURL(url) {
  var userURL = (url) ? url : "http://9to5mac.com/";
  $.ajax({
    url: "words",
    type: 'get',
    dataType: 'text',
    data: {url: userURL},
    success: function(data) {
      var words = buildWordsArray(data);
      words = arrayUnique(words);
      words = d3.shuffle(words);
      words = words.splice(0, wordsOnPage);
      startDraw(words);
    },
    error: function(data) {
      console.log("Can not connect to the server.");
    }
  });
}

// drawing the words on screen
function drawWords(words) {

  var projection = d3.select("#words-container").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
      .attr("transform", "translate(150,150)")
    .selectAll("text")
      .data(words);

  projection.transition()
    .attr("transform", function(d) {
      return "translate(" + [d.x + offsetX, d.y + offsetY] + ")rotate(" + d.rotate + ")";
    })
    .style("font-size", function(d) {
      return d.size + "px";
    });

  projection.enter().append("text")
    .attr("text-anchor", "middle")
    .attr("transform", function(d) {
      return "translate(" + [d.x + offsetX, d.y + offsetY] + ")rotate(" + d.rotate + ")";
    })
    .style("font-size", function(d) {
      return d.size + "px";
    })
    .style("opacity", 1e-6)
    .transition()
    .duration(10)
    .style("opacity", 1);

  projection
    .style("font-family", 'Impact')
    .style("fill",function(d,i) {
      return color(i);
    })
    .text(function(d) {
      return d.text;
    });

  projection.exit().remove();
}

// Main function: getting all the words and setting there position on screen
function startDraw(pageWords) {
  d3.layout.cloud()
    .timeInterval(10)
    .size([svgWidth, svgHeight])
    .words( pageWords.map(function(d) { return { text: d, size: 10 + Math.random() * 90 }; }) )
    .padding(5)
    .rotate(function() { return ~~(Math.random() * 2) * 90; })
    .font("Impact")
    .fontSize(function(d) { return d.size; })
    .on("end", drawWords)
    .start();
}

function animateForm() {
  var $el = $('#settings');
  var top = ($el.position().top < 0) ? 0 : -$el.height();
  $el.animate({'top': top + 'px'}, 500, 'swing');
}

function eventsHandlers() {
  $('#click-me-button').on('click', function(event) {
    animateForm();
  });
  $('#go-button').on('click', function(event) {
    event.preventDefault();
    $('svg').remove();
    animateForm();
    getURL($('#url-input').val());
    $('#url-input').val('');
  });
}

window.onload = function() {
  eventsHandlers();
  getURL();
};