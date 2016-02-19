var i = 0;

function timedCount()
{
  'use strict';
  i = i + 1;
  postMessage(i);
  setTimeout("timedCount()", 60000);
}

timedCount(); 