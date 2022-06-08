// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./DaoToken.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Dao {
    using Counters for Counters.Counter;

    address public owner;
    Counters.Counter private proposalIds;
    DaoToken daoToken;

    struct Proposal {
        uint256 id;
        string description;
        uint256 deadline;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 progress;
        mapping(address=>bool) votedAddresses;
        bool votesCounted;
        bool passed;
    }

    mapping(uint256=>Proposal) public proposals;

    event ProposalCreated(
        uint256 id,
        string description,
        address proposer
    );

    event NewVote(
        uint256 votesFor,
        uint256 votesAgainst,
        address voter,
        uint256 proposal,
        bool votedFor,
        uint256 progress
    );

    event ProposalClosed(
        uint256 id,
        bool passed,
        uint256 progress
    );

    constructor(address _daoTokenAddress) {
        owner = msg.sender;
        daoToken = DaoToken(_daoTokenAddress);
    }

    function isMember(address _address) private view returns (bool){
        if(daoToken.balanceOf(_address) > 0){
            return true;
        }
        return false;
    }

    modifier onlyMember() {
        require(isMember(msg.sender), "Only DAO's member can do this");
        _;
    }

    function isCanVote(uint256 _proposal, address _voter) private view onlyMember returns (bool){
        if(proposals[_proposal].votedAddresses[_voter]){
            return false;
        }
        return true;
    }

    function createProposal(string memory _description, uint256 _deadline) public onlyMember{
        proposalIds.increment();

        uint256 newProposalId = proposalIds.current();

        Proposal storage newProposal = proposals[newProposalId];
        newProposal.id = newProposalId;
        newProposal.description = _description;
        newProposal.deadline = _deadline;

        emit ProposalCreated(newProposalId, _description, msg.sender);
    }

    function vote(uint256 _id, bool _vote) public {
        require(bytes(proposals[_id].description).length>0, "This proposal doesn't exits");
        require(isCanVote(_id, msg.sender), "You already voted this proposal");
        require(proposals[_id].deadline >= block.timestamp, "The deadline has passed for this proposal");

        Proposal storage proposal = proposals[_id];
        if(_vote){
            proposal.votesFor++;
        }else{
            proposal.votesAgainst++;
        }
        proposal.votedAddresses[msg.sender] = true;
        proposal.progress += daoToken.balanceOf(msg.sender);

        emit NewVote(proposal.votesFor, proposal.votesAgainst, msg.sender, _id, _vote, proposal.progress);
    }

    function countVotes(uint256 _id) onlyMember public {
        require(bytes(proposals[_id].description).length>0, "This proposal doesn't exits");
        require(proposals[_id].deadline < block.timestamp, "The deadline hasn't passed yet");
        require(!proposals[_id].votesCounted, "Proposal count already conducted");

        Proposal storage proposal = proposals[_id];

        if(proposal.votesFor >= proposal.votesAgainst){
            proposal.passed = true;
        }
        proposal.votesCounted = true;

        emit ProposalClosed(_id, proposal.passed, proposal.progress);
    }
}
