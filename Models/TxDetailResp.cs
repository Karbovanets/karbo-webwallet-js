using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebWallet.Models
{
    public class TxPoolResp
    {
        public TxDetailResp result { get; set; }
    }
    public class TxDetailResp
    {
        public List<TxResp> transactions { get; set; }
    }

    public class TxResp
    {
        public int Id { get; set; }
        public string blockHash { get; set; }
        public int blockIndex { get; set; }
        public TxExtra extra { get; set; }
        public Int64 fee { get; set; }
        public string hash { get; set; }
        public List<Input> inputs { get; set; }
        public List<Output> outputs { get; set; }
        public List<Signature> signatures { get; set; }
        public bool inBlockchain { get; set; }
        public int mixin { get; set; }
        public string paymentId { get; set; }
        public int size { get; set; }
        public int timestamp { get; set; }
        public Int64 totalInputsAmount { get; set; }
        public Int64 totalOutputsAmount { get; set; }
        public int unlockTime { get; set; }
    }

    public class TxExtra {
        public string publicKey { get; set; }
    }
    public class Input
    {
        public InputData data { get; set; }
        public string type { get; set; }
    }

    public class InputData
    {
        public Int64 amount { get; set; }
        public InputDataInput input { get; set; }
        public InputDataOutput output { get; set; }
        public int mixin { get; set; }

        public string type { get; set; }
    }

    public class InputDataInput
    {
        
        public string k_image { get; set; }
        public Int64 amount { get; set; }
        public List<int> key_offsets { get; set; }
    }

    public class InputDataOutput
    {
        public int number { get; set; }
        public string transactionHash { get; set; }
    }

    public class Output
    {
        public int globalIndex { get; set; }
        public OutputOutput output { get; set; }
    }

    public class OutputOutput
    {
        public Int64 amount { get; set; }
        public OutputTarget target { get; set; }
    }
    public class OutputTarget
    {
        public OutputTargetData data { get; set; }
        public string type { get; set; }
    }

    public class OutputTargetData
    {
        public string key { get; set; }
    }
    public class Signature
    {
        public int first { get; set; }
        public string second { get; set; }
    }
}
