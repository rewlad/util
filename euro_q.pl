#!/usr/bin/perl
use strict;
use LWP::UserAgent;
print("usage example:\n $0 Fin 2002 20c\n"), exit if !@ARGV;
my($s_state,$s_year,$s_coin)=@ARGV;
my @coins = qw(h h h 1c 2c 5c 10c 20c 50c 1e 2e);
my %coin2idx = map{($coins[$_]=>$_)} 0..$#coins;
my $col = $coin2idx{$s_coin} || die "possible coins: ".join(' ',@coins);
/\W/ and die 'bad state' for $s_state;
for my $person(qw[kristina liona andry]){
    my $resp = LWP::UserAgent->new->get("http://euro.we2.edss.ee/$person.html");
    die "http get fail for $person" if !$resp->is_success;
    print "$person: ", search4person($resp->decoded_content), "\n";
}
sub search4person{
    my($cnt)=@_;
    for(split "</TABLE>", $cnt){
        /<A\s+NAME="search$s_state\w*">/ || next;
        for(split '</TR>',$_){
            my @cells = split '</TD>',$_;
            $#cells == 11 or next;
            my $year = $cells[1]=~/;(\d{4})/ ? $1 : next;
            $year eq $s_year || next;
            $cells[$col]=~/(&nbsp;|X)\s*$/ and return "$1";
            print $#cells,"\n";
        }
    }
    '?';
}


