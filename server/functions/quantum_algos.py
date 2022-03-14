import numpy as np
import math
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister

# Shor's Algorithm
def Shors_algo():
    def c_amod15(a, power):
        """Controlled multiplication by a mod 15"""
        if a not in [2, 7, 8, 11, 13]:
            raise ValueError("'a' must be 2,7,8,11 or 13")
        U = QuantumCircuit(4)
        for iteration in range(power):
            if a in [2, 13]:
                U.swap(0, 1)
                U.swap(1, 2)
                U.swap(2, 3)
            if a in [7, 8]:
                U.swap(2, 3)
                U.swap(1, 2)
                U.swap(0, 1)
            if a == 11:
                U.swap(1, 3)
                U.swap(0, 2)
            if a in [7, 11, 13]:
                for q in range(4):
                    U.x(q)
        U = U.to_gate()
        U.name = "%i^%i mod 15" % (a, power)
        c_U = U.control()
        return c_U


    def qft_dagger(n):
        """n-qubit QFTdagger the first n qubits in circ"""
        qc = QuantumCircuit(n)
        # Don't forget the Swaps!
        for qubit in range(n // 2):
            qc.swap(qubit, n - qubit - 1)
        for j in range(n):
            for m in range(j):
                qc.cp(-np.pi / float(2 ** (j - m)), m, j)
            qc.h(j)
        qc.name = "QFT†"
        return qc


    # Specify variables
    n_count = 3  # number of counting qubits
    a = 7

    # Create QuantumCircuit with n_count counting qubits
    # plus 4 qubits for U to act on
    qc = QuantumCircuit(n_count + 4, n_count)

    # And auxiliary register in state |1>
    qc.x(3 + n_count)

    # Do controlled-U operations
    for q in range(n_count):
        qc.append(c_amod15(a, 2 ** q),
                  [q] + [i + n_count for i in range(4)])

    # Do inverse-QFT
    qc.append(qft_dagger(n_count), range(n_count))

    # Measure circuit
    qc.measure(range(n_count), range(n_count))
    # print(qc.draw(fold=-1))  # -1 means 'do not fold'


    return qc


# A simple algo
def two_qubit_algo():
    qreg_q = QuantumRegister(2, 'q')
    creg_c = ClassicalRegister(2, 'c')
    circuit = QuantumCircuit(qreg_q, creg_c)

    circuit.x(qreg_q[1])
    circuit.cx(qreg_q[1], qreg_q[0])
    circuit.h(qreg_q[0])
    circuit.h(qreg_q[1])
    circuit.cx(qreg_q[1], qreg_q[0])
    circuit.h(qreg_q[0])
    circuit.h(qreg_q[1])
    circuit.cx(qreg_q[1], qreg_q[0])
    circuit.x(qreg_q[1])
    circuit.cx(qreg_q[1], qreg_q[0])
    circuit.measure_all()



    circuit.measure_all()

    return circuit


# QFT算法
def QFT():
    def qft_rotations(circuit, n):
        """Performs qft on the first n qubits in circuit (without swaps)"""
        if n == 0:
            return circuit
        n -= 1
        circuit.h(n)
        for qubit in range(n):
            circuit.cp(math.pi / 2 ** (n - qubit), qubit, n)
        # At the end of our function, we call the same function again on
        # the next qubits (we reduced n by one earlier in the function)
        qft_rotations(circuit, n)

    def swap_registers(circuit, n):
        for qubit in range(n // 2):
            circuit.swap(qubit, n - qubit - 1)
        return circuit

    def qft(circuit, n):
        """QFT on the first n qubits in circuit"""
        qft_rotations(circuit, n)
        swap_registers(circuit, n)
        return circuit

    def inverse_qft(circuit, n):
        """Does the inverse QFT on the first n qubits in circuit"""
        # First we create a QFT circuit of the correct size:
        qft_circ = qft(QuantumCircuit(n), n)
        # Then we take the inverse of this circuit
        invqft_circ = qft_circ.inverse()
        # And add it to the first n qubits in our existing circuit
        circuit.append(invqft_circ, circuit.qubits[:n])
        return circuit.decompose()  # .decompose() allows us to see the individual gates


    nqubits = 3
    number = 5
    qc = QuantumCircuit(nqubits)
    for qubit in range(nqubits):
        qc.h(qubit)
    qc.p(number * math.pi / 4, 0)
    qc.p(number * math.pi / 2, 1)
    qc.p(number * math.pi, 2)

    qc = inverse_qft(qc, nqubits)
    qc.measure_all()

    return qc



def Grover():
    n = 2
    qc = QuantumCircuit(n)

    def initialize_s(qc, qubits):
        """Apply a H-gate to 'qubits' in qc"""
        for q in qubits:
            qc.h(q)
        return qc

    qc = initialize_s(qc, [0, 1])
    qc.cz(0, 1)
    qc.h([0, 1])
    qc.z([0, 1])
    qc.cz(0, 1)
    qc.h([0, 1])

    return qc


def BV():
    n = 3  # number of qubits used to represent s
    s = '011'  # the hidden binary string

    bv_circuit = QuantumCircuit(n + 1, n)

    # put auxiliary in state |->
    bv_circuit.h(n)
    bv_circuit.z(n)

    # Apply Hadamard gates before querying the oracle
    for i in range(n):
        bv_circuit.h(i)

    # Apply barrier
    bv_circuit.barrier()

    # Apply the inner-product oracle
    s = s[::-1]  # reverse s to fit qiskit's qubit ordering
    for q in range(n):
        if s[q] == '0':
            bv_circuit.i(q)
        else:
            bv_circuit.cx(q, n)

    # Apply barrier
    bv_circuit.barrier()

    # Apply Hadamard gates after querying the oracle
    for i in range(n):
        bv_circuit.h(i)

    # Measurement
    for i in range(n):
        bv_circuit.measure(i, i)

    return bv_circuit

def scaleable_Shors_algo():
    N = 15
    m = int(np.ceil(np.log2(N)))

    U_qc = QuantumCircuit(m)
    U_qc.x(range(m))
    U_qc.swap(1, 2)
    U_qc.swap(2, 3)
    U_qc.swap(0, 3)

    U = U_qc.to_gate()
    U.name = '{}Mod{}'.format(7, N)

    def cU_multi(k):
        circ = QuantumCircuit(m)
        for _ in range(2 ** k):
            circ.append(U, range(m))

        U_multi = circ.to_gate()
        U_multi.name = '7Mod15_[2^{}]'.format(k)

        cU_multi = U_multi.control()
        return cU_multi

    def qft(n):
        """Creates an n-qubit QFT circuit"""
        circuit = QuantumCircuit(n)

        def swap_registers(circuit, n):
            for qubit in range(n // 2):
                circuit.swap(qubit, n - qubit - 1)
            return circuit

        def qft_rotations(circuit, n):
            """Performs qft on the first n qubits in circuit (without swaps)"""
            if n == 0:
                return circuit
            n -= 1
            circuit.h(n)
            for qubit in range(n):
                circuit.cp(np.pi / 2 ** (n - qubit), qubit, n)
            qft_rotations(circuit, n)

        qft_rotations(circuit, n)
        swap_registers(circuit, n)
        return circuit

    t = 3
    shor_QPE = QuantumCircuit(t + m, t)
    shor_QPE.h(range(t))

    shor_QPE.x(t)
    for idx in range(t - 1):
        shor_QPE.append(cU_multi(idx), [idx] + list(range(t, t + m)))

    qft_dag = qft(t).inverse()
    qft_dag.name = 'QFT+'

    shor_QPE.append(qft_dag, range(t))
    shor_QPE.measure(range(t), range(t))

    return shor_QPE


