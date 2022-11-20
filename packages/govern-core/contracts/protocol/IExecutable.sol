// SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;

interface IExecutable {
    function canExecute(address executer) external returns (bool);
}
