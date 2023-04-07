<?php
  // Hard-code the answer
  $dimensionArrayAnswer = [
    ['2', '', '1', '', '3', '<', '4'],
    ['', '', '', '', '', '', ''],
    ['4', '', '3', '', '1', '<', '2'],
    ['', '', '', '', '', '', '^'],
    ['1', '', '2', '', '4', '', '3'],
    ['', '', '', '', 'V', '', ''],
    ['3', '', '4', '', '2', '', '1'],
  ];

  $content = json_decode($_POST['content'], true);

  $board = $content['board'];

  // Iterate through the board
  for ($i = 0; $i < count($board); $i++) {
    for ($j = 0; $j < count($board[$i]); $j++) {
      // Check if the current cell type is "blank"
      if ($board[$i][$j]['type'] === 'blank') {
        // Convert the current cell value to an integer (if not empty)
        if ($board[$i][$j]['value'] !== '') {
          $board[$i][$j]['value'] = intval($board[$i][$j]['value']);
        }

        // Convert the corresponding answer value to an integer (if not empty)
        $intValue = $dimensionArrayAnswer[$i][$j] !== '' ? intval($dimensionArrayAnswer[$i][$j]) : '';

        // Compare the current cell value with the corresponding answer value
        if ($board[$i][$j]['value'] === $intValue) {
            $board[$i][$j]['type'] = 'correct';
        } else {
            $board[$i][$j]['type'] = 'incorrect';
        }

        $board[$i][$j]['answer'] = $intValue;
        $board[$i][$j]['state'] = 'locked';
      }
    }
  }

  // Encode the response as a JSON string and echo it
  echo json_encode($board);
?>
