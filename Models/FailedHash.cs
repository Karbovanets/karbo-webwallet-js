using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebWallet.Models
{
    public class FailedHash
    {
        public int Id { get; set; } //required for BSON storage
        public int height { get; set; } //height
        public string hash { get; set; } //height

        public string DbFile { get; set; } //the name of the Tx cache DB file
        public int FetchAttempts { get; set; }
    }
}
